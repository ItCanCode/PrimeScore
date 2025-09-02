// tests/displayController.test.js
jest.mock('../src/config/firebaseAdmin.js', () => {
  const mockCollection = jest.fn();
  const mockDoc = jest.fn();
  const mockGet = jest.fn();

  mockCollection.mockReturnValue({
    doc: mockDoc,
    get: mockGet, // Needed for collection().get()
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

import { getMatchEventsById, getmatchEvents } from '../src/controllers/displayController.js';

describe('Display Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: 'test-match-id' } };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // ------------------ getMatchEventsById ------------------
  describe('getMatchEventsById', () => {
    it('should return match events when found', async () => {
      const mockEventData = { events: [{ eventType: 'Goal', team: 'Home' }] };

      __mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => mockEventData,
      });

      await getMatchEventsById(req, res);

      expect(__mockCollection).toHaveBeenCalledWith('match_events');
      expect(__mockDoc).toHaveBeenCalledWith('test-match-id');
      expect(res.json).toHaveBeenCalledWith(mockEventData);
    });

    it('should return 404 when match events not found', async () => {
      __mockGet.mockResolvedValueOnce({ exists: false });

      await getMatchEventsById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Match events not found' });
    });

    it('should handle errors', async () => {
      __mockGet.mockRejectedValueOnce(new Error('Firestore error'));

      await getMatchEventsById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Firestore error' });
    });
  });

  // ------------------ getmatchEvents ------------------
  describe('getmatchEvents', () => {
    it('should return only ongoing matches with events', async () => {
      // Fake Firestore match docs
      const mockMatchDocs = [
        { id: 'm1', data: () => ({ status: 'ongoing', home: 'A' }) },
        { id: 'm2', data: () => ({ status: 'scheduled', home: 'B' }) },
      ];

      // Mock matches collection snapshot
      __mockGet
        .mockResolvedValueOnce({ docs: mockMatchDocs }) // matches collection
        .mockResolvedValueOnce({ exists: true, data: () => ({ home_score: 1, away_score: 0 }) }); // match_events for m1

      req = {}; // no params for this one
      await getmatchEvents(req, res);

      expect(__mockCollection).toHaveBeenCalledWith('matches');
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'm1',
          status: 'ongoing',
          homeScore: 1,
          awayScore: 0,
        }),
      ]);
    });

    it('should return empty array if no ongoing matches', async () => {
      __mockGet.mockResolvedValueOnce({ docs: [] }); // no matches

      await getmatchEvents(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle errors', async () => {
      __mockGet.mockRejectedValueOnce(new Error('Firestore error'));

      await getmatchEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Firestore error' });
    });
  });
});
