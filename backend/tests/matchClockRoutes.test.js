// matchClockRoutes.test.js
import request from 'supertest';
import express from 'express';
import { jest, describe, test, beforeEach, afterEach, expect } from '@jest/globals';
import matchClockRoutes from '../src/routes/matchClockRoutes.js';

// Mock Firebase Admin
jest.mock('../src/config/firebaseAdmin.js', () => {
  const mockCollection = jest.fn();
  const mockDoc = jest.fn();
  const mockSet = jest.fn();
  const mockGet = jest.fn();
  const mockUpdate = jest.fn();

  // Setup method chaining
  mockCollection.mockReturnValue({
    doc: mockDoc
  });

  mockDoc.mockReturnValue({
    set: mockSet,
    get: mockGet,
    update: mockUpdate
  });

  const mockFirestore = jest.fn(() => ({
    collection: mockCollection
  }));

  mockFirestore.Timestamp = {
    now: jest.fn(() => ({ toDate: () => new Date() }))
  };

  mockFirestore.FieldValue = {
    serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP')
  };

  return {
    firestore: mockFirestore,
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn()
    }
  };
});

// Get access to the mocked admin after importing
import admin from '../src/config/firebaseAdmin.js';
const mockFirestore = admin.firestore();

describe('Match Clock API Routes', () => {
  let app;
  const testMatchId = 'test-match-456';

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/match-clock', matchClockRoutes);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /:matchId/start', () => {
    test('creates new clock when none exists', async () => {
      const mockClockRef = {
        get: jest.fn().mockResolvedValue({ exists: false }),
        set: jest.fn().mockResolvedValue()
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockClockRef)
      });

      const response = await request(app)
        .post(`/api/match-clock/${testMatchId}/start`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.clock).toMatchObject({
        matchId: testMatchId,
        elapsed: 0,
        running: true
      });

      expect(mockClockRef.set).toHaveBeenCalledWith(
        expect.objectContaining({
          matchId: testMatchId,
          elapsed: 0,
          running: true,
          pausedReason: null
        })
      );
    });

    test('resumes existing paused clock', async () => {
      const existingClockData = {
        matchId: testMatchId,
        elapsed: 1200, // 20 minutes
        running: false,
        pausedReason: 'Half-time'
      };

      const mockClockRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => existingClockData
        }),
        update: jest.fn().mockResolvedValue()
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockClockRef)
      });

      const response = await request(app)
        .post(`/api/match-clock/${testMatchId}/start`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockClockRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          running: true,
          pausedReason: null
        })
      );
    });

    test('handles database errors', async () => {
      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      const response = await request(app)
        .post(`/api/match-clock/${testMatchId}/start`)
        .expect(500);

      expect(response.body.error).toBe('Failed to start match clock');
    });
  });

  describe('POST /:matchId/pause', () => {
    test('pauses running clock with reason', async () => {
      const runningClockData = {
        matchId: testMatchId,
        elapsed: 600, // 10 minutes
        running: true,
        startTime: {
          toDate: () => new Date(Date.now() - 300000) // Started 5 minutes ago
        }
      };

      const mockClockRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => runningClockData
        }),
        update: jest.fn().mockResolvedValue()
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockClockRef)
      });

      const response = await request(app)
        .post(`/api/match-clock/${testMatchId}/pause`)
        .send({ reason: 'Injury timeout' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockClockRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          running: false,
          pausedReason: 'Injury timeout',
          startTime: null,
          elapsed: expect.any(Number) // Should be updated with accumulated time
        })
      );

      // Elapsed time should include the additional 5 minutes (300 seconds)
      const updateCall = mockClockRef.update.mock.calls[0][0];
      expect(updateCall.elapsed).toBeGreaterThan(600); // Original 600 + additional time
    });

    test('returns 404 for non-existent clock', async () => {
      const mockClockRef = {
        get: jest.fn().mockResolvedValue({ exists: false })
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockClockRef)
      });

      const response = await request(app)
        .post(`/api/match-clock/${testMatchId}/pause`)
        .send({ reason: 'Tactical break' })
        .expect(404);

      expect(response.body.error).toBe('Match clock not found');
    });

    test('handles missing reason gracefully', async () => {
      const clockData = {
        matchId: testMatchId,
        elapsed: 900,
        running: true,
        startTime: { toDate: () => new Date(Date.now() - 60000) }
      };

      const mockClockRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => clockData
        }),
        update: jest.fn().mockResolvedValue()
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockClockRef)
      });

      const response = await request(app)
        .post(`/api/match-clock/${testMatchId}/pause`)
        .send({}) // No reason provided
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockClockRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          running: false,
          pausedReason: null
        })
      );
    });
  });

  describe('POST /:matchId/finish', () => {
    test('finishes running clock', async () => {
      const runningClockData = {
        matchId: testMatchId,
        elapsed: 2400, // 40 minutes
        running: true,
        startTime: {
          toDate: () => new Date(Date.now() - 300000) // 5 minutes ago
        }
      };

      const mockClockRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => runningClockData
        }),
        update: jest.fn().mockResolvedValue()
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockClockRef)
      });

      const response = await request(app)
        .post(`/api/match-clock/${testMatchId}/finish`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockClockRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          running: false,
          startTime: null,
          pausedReason: 'Match finished',
          elapsed: expect.any(Number)
        })
      );
    });

    test('finishes already paused clock', async () => {
      const pausedClockData = {
        matchId: testMatchId,
        elapsed: 2700, // 45 minutes
        running: false,
        pausedReason: 'Half-time'
      };

      const mockClockRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => pausedClockData
        }),
        update: jest.fn().mockResolvedValue()
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockClockRef)
      });

      const response = await request(app)
        .post(`/api/match-clock/${testMatchId}/finish`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockClockRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          running: false,
          pausedReason: 'Match finished',
          elapsed: 2700 // Should remain the same
        })
      );
    });
  });

  describe('GET /:matchId', () => {
    test('returns clock data for existing clock', async () => {
      const clockData = {
        matchId: testMatchId,
        elapsed: 1800, // 30 minutes
        running: true,
        startTime: {
          toDate: () => new Date(Date.now() - 120000) // 2 minutes ago
        },
        pausedReason: null
      };

      const mockClockRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => clockData
        }),
        update: jest.fn() // For potential auto-stop
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockClockRef)
      });

      const response = await request(app)
        .get(`/api/match-clock/${testMatchId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.matchId).toBe(testMatchId);
      expect(response.body.elapsed).toBeGreaterThan(1800); // Should include additional 2 minutes
      expect(response.body.running).toBe(true);
    });

    test('returns default data for non-existent clock', async () => {
      const mockClockRef = {
        get: jest.fn().mockResolvedValue({ exists: false })
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockClockRef)
      });

      const response = await request(app)
        .get(`/api/match-clock/${testMatchId}`)
        .expect(200);

      expect(response.body).toEqual({
        elapsed: 0,
        running: false,
        matchId: testMatchId
      });
    });

    test('auto-stops clock after 3 hours', async () => {
      const longRunningClockData = {
        matchId: testMatchId,
        elapsed: 10500, // 2 hours 55 minutes
        running: true,
        startTime: {
          toDate: () => new Date(Date.now() - 600000) // 10 minutes ago (total > 3 hours)
        }
      };

      const mockClockRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => longRunningClockData
        }),
        update: jest.fn().mockResolvedValue()
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockClockRef)
      });

      const response = await request(app)
        .get(`/api/match-clock/${testMatchId}`)
        .expect(200);

      expect(response.body.elapsed).toBe(10800); // Exactly 3 hours
      expect(mockClockRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          elapsed: 10800,
          running: false,
          pausedReason: 'Auto-stopped after 3 hours'
        })
      );
    });

    test('handles database errors', async () => {
      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockRejectedValue(new Error('Database connection failed'))
        })
      });

      const response = await request(app)
        .get(`/api/match-clock/${testMatchId}`)
        .expect(500);

      expect(response.body.error).toBe('Failed to get match clock');
    });
  });

  describe('Time calculations', () => {
    test('correctly calculates elapsed time for running clock', async () => {
      const startTime = new Date(Date.now() - 7 * 60 * 1000); // 7 minutes ago
      const clockData = {
        matchId: testMatchId,
        elapsed: 600, // 10 minutes previously accumulated
        running: true,
        startTime: { toDate: () => startTime }
      };

      const mockClockRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => clockData
        }),
        update: jest.fn()
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockClockRef)
      });

      const response = await request(app)
        .get(`/api/match-clock/${testMatchId}`)
        .expect(200);

      // Should be approximately 10 minutes (600s) + 7 minutes (420s) = 17 minutes (1020s)
      expect(response.body.elapsed).toBeGreaterThanOrEqual(1010);
      expect(response.body.elapsed).toBeLessThanOrEqual(1030);
    });

    test('returns exact elapsed time for paused clock', async () => {
      const clockData = {
        matchId: testMatchId,
        elapsed: 1337, // Exact accumulated time
        running: false,
        pausedReason: 'Strategic timeout'
      };

      const mockClockRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => clockData
        }),
        update: jest.fn()
      };

      mockFirestore.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockClockRef)
      });

      const response = await request(app)
        .get(`/api/match-clock/${testMatchId}`)
        .expect(200);

      expect(response.body.elapsed).toBe(1337);
      expect(response.body.running).toBe(false);
      expect(response.body.pausedReason).toBe('Strategic timeout');
    });
  });
});
