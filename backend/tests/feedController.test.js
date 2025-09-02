// tests/feedController.test.js
// Mock the firebaseAdmin module first
jest.mock('../src/config/firebaseAdmin.js', () => {
  // Create mock functions
  const mockCollection = jest.fn();
  const mockDoc = jest.fn();
  const mockSet = jest.fn();
  const mockUpdate = jest.fn();
  
  
  const mockArrayUnion = jest.fn((...args) => ({ type: 'arrayUnion', args }));
  const mockIncrement = jest.fn((n) => ({ type: 'increment', value: n }));
  const mockServerTimestamp = jest.fn(() => ({ type: 'serverTimestamp' }));

  mockCollection.mockReturnValue({
    doc: mockDoc,
  });

  mockDoc.mockReturnValue({
    set: mockSet,
    update: mockUpdate,
  });


  const mockFirestore = jest.fn(() => ({
    collection: mockCollection,
  }));
  

  mockFirestore.FieldValue = {
    arrayUnion: mockArrayUnion,
    increment: mockIncrement,
    serverTimestamp: mockServerTimestamp,
  };

  return {
    firestore: mockFirestore,
    initializeApp: jest.fn(),
    __mockCollection: mockCollection,
    __mockDoc: mockDoc,
    __mockSet: mockSet,
    __mockUpdate: mockUpdate,
    __mockArrayUnion: mockArrayUnion,
    __mockIncrement: mockIncrement,
    __mockServerTimestamp: mockServerTimestamp,
  };
});

import admin from '../src/config/firebaseAdmin.js';
const {
  __mockCollection,
  __mockDoc,
  __mockSet,
  __mockUpdate,
  __mockArrayUnion,
  __mockIncrement,
  __mockServerTimestamp
} = admin;

import { startMatch, recordGoal, recordSubstitution, recordFoul } from '../src/controllers/feedController.js';

describe('Match Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    
    jest.clearAllMocks();
  });

  describe('startMatch', () => {
    it('should start a match successfully', async () => {
      req.params = { matchId: 'test-match-id' };
      req.body = { homeTeam: 'Team A', awayTeam: 'Team B' };

      __mockSet.mockResolvedValueOnce();

      await startMatch(req, res);

      
      expect(__mockCollection).toHaveBeenCalledWith('match_events');
      expect(__mockDoc).toHaveBeenCalledWith('test-match-id');
      
      expect(__mockSet).toHaveBeenCalledWith({
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        updatedAt: { type: 'serverTimestamp' },
      });
      
    
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Match started!' });
    });

    it('should handle errors when starting a match', async () => {
      req.params = { matchId: 'test-match-id' };
      req.body = { homeTeam: 'Team A', awayTeam: 'Team B' };

 
      const error = new Error('Firestore error');
      __mockSet.mockRejectedValueOnce(error);

      await startMatch(req, res);

     
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to start match' });
    });
  });

  describe('recordGoal', () => {
    it('should record a goal successfully', async () => {
      req.params = { matchId: 'test-match-id' };
      req.body = { time: 45, team: 'home', player: 'Player 1' };


      __mockUpdate.mockResolvedValueOnce();

      await recordGoal(req, res);

     
      expect(__mockCollection).toHaveBeenCalledWith('match_events');
      expect(__mockDoc).toHaveBeenCalledWith('test-match-id');
      
   
      expect(__mockUpdate).toHaveBeenCalledWith({
        goals: { type: 'arrayUnion', args: [{ time: 45, team: 'home', player: 'Player 1' }] },
        home_score: { type: 'increment', value: 1 },
        updatedAt: { type: 'serverTimestamp' },
      });
      

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Goal recorded!' });
    });

    it('should record an away goal correctly', async () => {
      req.params = { matchId: 'test-match-id' };
      req.body = { time: 60, team: 'away', player: 'Player 2' };

    
      __mockUpdate.mockResolvedValueOnce();

      await recordGoal(req, res);

  a
      expect(__mockUpdate).toHaveBeenCalledWith({
        goals: { type: 'arrayUnion', args: [{ time: 60, team: 'away', player: 'Player 2' }] },
        away_score: { type: 'increment', value: 1 },
        updatedAt: { type: 'serverTimestamp' },
      });
      
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Goal recorded!' });
    });

    it('should return error for missing required fields', async () => {
      req.params = { matchId: 'test-match-id' };
      req.body = { time: 45 }; // Missing team and player

      await recordGoal(req, res);

      // Verify error response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'team, player, and time are required' });
    });

    it('should handle errors when recording a goal', async () => {
      req.params = { matchId: 'test-match-id' };
      req.body = { time: 45, team: 'home', player: 'Player 1' };

      // Mock the update operation to fail
      const error = new Error('Firestore error');
      __mockUpdate.mockRejectedValueOnce(error);

      await recordGoal(req, res);

      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to record goal' });
    });
  });

  describe('recordSubstitution', () => {
    it('should record a substitution successfully', async () => {
      req.params = { matchId: 'test-match-id' };
      req.body = { time: 60, team: 'home', playerIn: 'Player 3', playerOut: 'Player 1' };

      // Mock the update operation
      __mockUpdate.mockResolvedValueOnce();

      await recordSubstitution(req, res);

      // Verify the query was built correctly
      expect(__mockCollection).toHaveBeenCalledWith('match_events');
      expect(__mockDoc).toHaveBeenCalledWith('test-match-id');
      
      // Verify the update was called with correct data
      expect(__mockUpdate).toHaveBeenCalledWith({
        substitutions: { type: 'arrayUnion', args: [{
          time: 60,
          team: 'home',
          playerIn: 'Player 3',
          playerOut: 'Player 1'
        }] },
        updatedAt: { type: 'serverTimestamp' },
      });
      
      // Verify the response
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Substitution recorded!' });
    });

    it('should return error for missing required fields', async () => {
      req.params = { matchId: 'test-match-id' };
      req.body = { time: 60, team: 'home' }; // Missing playerIn and playerOut

      await recordSubstitution(req, res);

      // Verify error response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: "team, playerIn, playerOut, and time are required" 
      });
    });

    it('should handle errors when recording a substitution', async () => {
      req.params = { matchId: 'test-match-id' };
      req.body = { time: 60, team: 'home', playerIn: 'Player 3', playerOut: 'Player 1' };

      // Mock the update operation to fail
      const error = new Error('Firestore error');
      __mockUpdate.mockRejectedValueOnce(error);

      await recordSubstitution(req, res);

      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to record substitution' });
    });
  });

  describe('recordFoul', () => {
    it('should record a foul successfully without a card', async () => {
      req.params = { matchId: 'test-match-id' };
      req.body = { time: 30, team: 'away', player: 'Player 2' };

      // Mock the update operation
      __mockUpdate.mockResolvedValueOnce();

      await recordFoul(req, res);

      // Verify the query was built correctly
      expect(__mockCollection).toHaveBeenCalledWith('match_events');
      expect(__mockDoc).toHaveBeenCalledWith('test-match-id');
      
      // Verify the update was called with correct data
      expect(__mockUpdate).toHaveBeenCalledWith({
        fouls: { type: 'arrayUnion', args: [{
          time: 30,
          team: 'away',
          player: 'Player 2',
          card: null
        }] },
        updatedAt: { type: 'serverTimestamp' },
      });
      
      // Verify the response
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Foul recorded!' });
    });

    it('should record a foul successfully with a card', async () => {
      req.params = { matchId: 'test-match-id' };
      req.body = { time: 30, team: 'away', player: 'Player 2', card: 'yellow' };

      // Mock the update operation
      __mockUpdate.mockResolvedValueOnce();

      await recordFoul(req, res);

      // Verify the update was called with correct data
      expect(__mockUpdate).toHaveBeenCalledWith({
        fouls: { type: 'arrayUnion', args: [{
          time: 30,
          team: 'away',
          player: 'Player 2',
          card: 'yellow'
        }] },
        updatedAt: { type: 'serverTimestamp' },
      });
      
      // Verify the response
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Foul recorded!' });
    });

    it('should return error for missing required fields', async () => {
      req.params = { matchId: 'test-match-id' };
      req.body = { time: 30 }; // Missing team and player

      await recordFoul(req, res);

      // Verify error response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: "team, player, and time are required" 
      });
    });

    it('should handle errors when recording a foul', async () => {
      req.params = { matchId: 'test-match-id' };
      req.body = { time: 30, team: 'away', player: 'Player 2' };

      // Mock the update operation to fail
      const error = new Error('Firestore error');
      __mockUpdate.mockRejectedValueOnce(error);

      await recordFoul(req, res);

  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to record foul' });
    });
  });
});