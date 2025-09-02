// tests/displayController.test.js
jest.mock('../src/config/firebaseAdmin.js', () => {
  const mockCollection = jest.fn();
  const mockDoc = jest.fn();
  const mockGet = jest.fn();

  mockCollection.mockReturnValue({
    doc: mockDoc,
  });

  mockDoc.mockReturnValue({
    get: mockGet,
  });

  return {
    firestore: () => ({
      collection: mockCollection,
    }),
    initializeApp: jest.fn(),
    __mockCollection: mockCollection,
    __mockDoc: mockDoc,
    __mockGet: mockGet,
  };
});

import admin from '../src/config/firebaseAdmin.js';
const { __mockCollection, __mockDoc, __mockGet } = admin;

// Import the function to test
import { getMatchEventsById } from '../src/controllers/displayController.js';

describe('Match Events Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        id: 'test-match-id',
      },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getMatchEventsById', () => {
    it('should return match events when found', async () => {
      // Mock event data
      const mockEventData = {
        events: [
          { eventType: 'Goal', team: 'Home' },
          { eventType: 'Foul', team: 'Away' },
        ]
      };

      // Mock the Firestore document to return data
      __mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => mockEventData,
      });

      await getMatchEventsById(req, res);

      // Verify the query was built correctly
      expect(__mockCollection).toHaveBeenCalledWith('match_events');
      expect(__mockDoc).toHaveBeenCalledWith('test-match-id');
      
      // Verify the response
      expect(res.status).not.toHaveBeenCalled(); // Should not call status for success
      expect(res.json).toHaveBeenCalledWith(mockEventData);
    });

    it('should return 404 when match events not found', async () => {
      // Mock the Firestore document to not exist
      __mockGet.mockResolvedValueOnce({
        exists: false,
      });

      await getMatchEventsById(req, res);

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Match events not found' });
    });

    it('should handle errors', async () => {
      // Mock Firestore error
      const error = new Error('Firestore error');
      __mockGet.mockRejectedValueOnce(error);

      await getMatchEventsById(req, res);

      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Firestore error' });
    });
  });
});