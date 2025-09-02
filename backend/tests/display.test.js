
jest.mock('../src/config/firebaseAdmin.js', () => {

  const mockCollection = jest.fn();
  const mockWhere = jest.fn();
  const mockGet = jest.fn();
 
  mockCollection.mockReturnValue({
    where: mockWhere,
  });
  
  mockWhere.mockReturnValue({
    get: mockGet,
  });
  
  return {
    firestore: () => ({
      collection: mockCollection,
    }),
    initializeApp: jest.fn(),

    __mockCollection: mockCollection,
    __mockWhere: mockWhere,
    __mockGet: mockGet,
  };
});

import admin from '../src/config/firebaseAdmin.js';
const { __mockCollection, __mockWhere, __mockGet } = admin;

// Import the function to test
import { getMatchStats } from '../src/controllers/displayController.js';

describe('Match Stats Controller', () => {
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

  describe('getMatchStats', () => {
    it('should calculate and return match statistics correctly', async () => {
      // Mock events data
      const mockEvents = [
        {
          eventType: 'Goal',
          team: 'Home',
        },
        {
          eventType: 'Goal',
          team: 'Away',
        },
        {
          eventType: 'Foul',
          team: 'Home',
        },
        {
          eventType: 'Yellow Card',
          team: 'Away',
        },
        {
          eventType: 'Red Card',
          team: 'Home',
        },
        {
          eventType: 'Penalty',
          team: 'Away',
        },
        {
          eventType: 'Corner Kick',
          team: 'Home',
        },
        {
          eventType: 'Free Kick',
          team: 'Away',
        },
      ];

      // Mock the Firestore query to return events
      __mockGet.mockResolvedValueOnce({
        docs: mockEvents.map(event => ({
          data: () => event,
        })),
      });

      await getMatchStats(req, res);

      // Verify the query was built correctly
      expect(__mockCollection).toHaveBeenCalledWith('match_events');
      expect(__mockWhere).toHaveBeenCalledWith('matchId', '==', 'test-match-id');
      
      // Verify the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        homeScore: 1,
        awayScore: 1,
        fouls: { Home: 1, Away: 0 },
        yellowCards: { Home: 0, Away: 1 },
        redCards: { Home: 1, Away: 0 },
        penalties: { Home: 0, Away: 1 },
        corners: { Home: 1, Away: 0 },
        freeKicks: { Home: 0, Away: 1 },
        goals: [{ eventType: 'Goal', team: 'Home' }, { eventType: 'Goal', team: 'Away' }],
        events: mockEvents,
      });
    });

    it('should handle empty events', async () => {
      // Mock empty events
      __mockGet.mockResolvedValueOnce({
        docs: [],
      });

      await getMatchStats(req, res);

      // Verify the response with all zeros
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        homeScore: 0,
        awayScore: 0,
        fouls: { Home: 0, Away: 0 },
        yellowCards: { Home: 0, Away: 0 },
        redCards: { Home: 0, Away: 0 },
        penalties: { Home: 0, Away: 0 },
        corners: { Home: 0, Away: 0 },
        freeKicks: { Home: 0, Away: 0 },
        goals: [],
        events: [],
      });
    });

    it('should handle errors', async () => {
      // Mock Firestore error
      const error = new Error('Firestore error');
      __mockGet.mockRejectedValueOnce(error);

      await getMatchStats(req, res);

      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Firestore error' });
    });

    it('should handle multiple events of the same type', async () => {
      // Mock multiple events of the same type
      const mockEvents = [
        { eventType: 'Goal', team: 'Home' },
        { eventType: 'Goal', team: 'Home' },
        { eventType: 'Foul', team: 'Away' },
        { eventType: 'Foul', team: 'Away' },
        { eventType: 'Yellow Card', team: 'Home' },
      ];

      // Mock the Firestore query to return events
      __mockGet.mockResolvedValueOnce({
        docs: mockEvents.map(event => ({
          data: () => event,
        })),
      });

      await getMatchStats(req, res);

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        homeScore: 2,
        awayScore: 0,
        fouls: { Home: 0, Away: 2 },
        yellowCards: { Home: 1, Away: 0 },
        redCards: { Home: 0, Away: 0 },
        penalties: { Home: 0, Away: 0 },
        corners: { Home: 0, Away: 0 },
        freeKicks: { Home: 0, Away: 0 },
        goals: [{ eventType: 'Goal', team: 'Home' }, { eventType: 'Goal', team: 'Home' }],
        events: mockEvents,
      });
    });
  });
});