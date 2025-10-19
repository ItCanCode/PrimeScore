// tests/displayController.test.js
jest.mock('../src/config/firebaseAdmin.js', () => {
  const mockCollection = jest.fn();
  const mockDoc = jest.fn();
  const mockGet = jest.fn();

  mockCollection.mockReturnValue({
    doc: mockDoc,
    get: mockGet, // for collection().get()
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

import {
  getMatchEventsById,
  getmatchEvents,
  getPastMatches,
} from '../src/controllers/displayController.js';

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

  // ---------------------------------------------------
  // getMatchEventsById
  // ---------------------------------------------------
  describe('getMatchEventsById', () => {
    it('returns match events when found', async () => {
      const mockEventData = { events: [{ type: 'Goal' }] };
      __mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => mockEventData,
      });

      await getMatchEventsById(req, res);

      expect(__mockCollection).toHaveBeenCalledWith('matchEvents');
      expect(__mockDoc).toHaveBeenCalledWith('test-match-id');
      expect(res.json).toHaveBeenCalledWith(mockEventData);
    });

    it('returns 404 when events not found', async () => {
      __mockGet.mockResolvedValueOnce({ exists: false });

      await getMatchEventsById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Match events not found' });
    });

    it('handles Firestore errors', async () => {
      __mockGet.mockRejectedValueOnce(new Error('Firestore error'));

      await getMatchEventsById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Firestore error' });
    });
  });

  // ---------------------------------------------------
  // getmatchEvents (ongoing)
  // ---------------------------------------------------
  describe('getmatchEvents', () => {
    it('returns ongoing matches with events', async () => {
      const mockMatchDocs = [
        { id: 'm1', data: () => ({ status: 'ongoing', home: 'A' }) },
        { id: 'm2', data: () => ({ status: 'scheduled', home: 'B' }) },
      ];

      __mockGet
        .mockResolvedValueOnce({ docs: mockMatchDocs }) // matches
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ homeScore: 1, awayScore: 0 }),
        }); // matchEvents for m1

      await getmatchEvents({}, res);

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

    it('handles when event doc does not exist', async () => {
      const mockMatchDocs = [{ id: 'm1', data: () => ({ status: 'ongoing' }) }];

      __mockGet
        .mockResolvedValueOnce({ docs: mockMatchDocs }) // matches
        .mockResolvedValueOnce({ exists: false }); // no event doc

      await getmatchEvents({}, res);

      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'm1', events: null }),
      ]);
    });

    it('returns empty array when no matches', async () => {
      __mockGet.mockResolvedValueOnce({ docs: [] });

      await getmatchEvents({}, res);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('handles Firestore error', async () => {
      __mockGet.mockRejectedValueOnce(new Error('Firestore error'));

      await getmatchEvents({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Firestore error' });
    });
  });

  // ---------------------------------------------------
  // getPastMatches (finished / has endTime)
  // ---------------------------------------------------
  describe('getPastMatches', () => {
    it('returns past matches with events', async () => {
      const mockMatchDocs = [
        { id: 'p1', data: () => ({ status: 'finished' }) },
        { id: 'p2', data: () => ({ end_time: 'some', status: 'paused' }) },
        { id: 'p3', data: () => ({ status: 'ongoing' }) },
      ];

      __mockGet
        .mockResolvedValueOnce({ docs: mockMatchDocs }) // matches
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ homeScore: 2, awayScore: 3 }),
        }) // p1
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ homeScore: 1, awayScore: 1 }),
        }); // p2

      await getPastMatches({}, res);

      expect(__mockCollection).toHaveBeenCalledWith('matches');
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'p1',
            homeScore: 2,
            awayScore: 3,
          }),
          expect.objectContaining({
            id: 'p2',
            homeScore: 1,
            awayScore: 1,
          }),
        ]),
      );
    });

    it('handles when event doc missing', async () => {
      const mockMatchDocs = [{ id: 'p1', data: () => ({ status: 'finished' }) }];

      __mockGet
        .mockResolvedValueOnce({ docs: mockMatchDocs }) // matches
        .mockResolvedValueOnce({ exists: false }); // no event doc

      await getPastMatches({}, res);

      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'p1', events: null }),
      ]);
    });

    it('handles Firestore error', async () => {
      __mockGet.mockRejectedValueOnce(new Error('Firestore error'));

      await getPastMatches({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Firestore error' });
    });
  });
});
