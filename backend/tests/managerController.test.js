// Mock the firebaseAdmin module
jest.mock('../src/config/firebaseAdmin.js', () => {
  const mockCollection = jest.fn();
  const mockDoc = jest.fn();
  const mockSet = jest.fn();
  const mockGet = jest.fn();
  const mockDelete = jest.fn();
  const mockWhere = jest.fn();
  const mockLimit = jest.fn();
  const mockBatch = jest.fn();
  const mockCommit = jest.fn();
  const mockServerTimestamp = jest.fn(() => ({ type: 'serverTimestamp' }));

  
  mockCollection.mockReturnValue({
    doc: mockDoc,
    where: mockWhere
  });

  mockDoc.mockReturnValue({
    set: mockSet,
    get: mockGet,
    delete: mockDelete,
    id: 'mock-doc-id'
  });

  mockWhere.mockReturnValue({
    limit: mockLimit
  });

  mockLimit.mockReturnValue({
    get: mockGet
  });

  mockBatch.mockReturnValue({
    set: jest.fn(),
    commit: mockCommit
  });

  const mockFirestore = jest.fn(() => ({
    collection: mockCollection,
    batch: mockBatch
  }));

  mockFirestore.FieldValue = {
    serverTimestamp: mockServerTimestamp
  };

  return {
    firestore: mockFirestore,
    initializeApp: jest.fn(),
    __mockCollection: mockCollection,
    __mockDoc: mockDoc,
    __mockSet: mockSet,
    __mockGet: mockGet,
    __mockDelete: mockDelete,
    __mockWhere: mockWhere,
    __mockLimit: mockLimit,
    __mockBatch: mockBatch,
    __mockCommit: mockCommit,
    __mockServerTimestamp: mockServerTimestamp
  };
});

import admin from '../src/config/firebaseAdmin.js';
const {
  __mockCollection,
  __mockDoc,
  __mockSet,
  __mockGet,
  __mockDelete,
  __mockWhere,
  __mockLimit,
  __mockBatch,
  __mockCommit
} = admin;

import managerController from '../src/controllers/managerController.js';

// Mock console.error
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe('Manager Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { uid: 'test-user-id' },
      body: {},
      params: {}
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('createTeam', () => {
    it('should create a team successfully', async () => {
      req.body = { 
        teamName: 'Test Team', 
        shortName: 'TT', 
        sportType: 'Football', 
        city: 'Test City' 
      };

      __mockSet.mockResolvedValueOnce();

      await managerController.createTeam(req, res);

      expect(__mockCollection).toHaveBeenCalledWith('teams');
      expect(__mockSet).toHaveBeenCalledWith({
        teamId: 'mock-doc-id',
        teamName: 'Test Team',
        shortName: 'TT',
        sportType: 'Football',
        city: 'Test City',
        createdBy: 'test-user-id',
        createdAt: { type: 'serverTimestamp' }
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Team created', 
        teamId: 'mock-doc-id' 
      });
    });

    it('should handle errors when creating a team', async () => {
      req.body = { 
        teamName: 'Test Team', 
        shortName: 'TT', 
        sportType: 'Football', 
        city: 'Test City' 
      };

      const error = new Error('Firestore error');
      __mockSet.mockRejectedValueOnce(error);

      await managerController.createTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Firestore error' });
    });
  });

  describe('addPlayers', () => {
    beforeEach(() => {
     
      admin.firestore().batch().set.mockImplementation(() => admin.firestore().batch());
    });

    it('should add players successfully', async () => {
      req.body = {
        teamId: 'test-team-id',
        players: [{ name: 'Player 1', position: 'Forward', number: 10, age: 25 }]
      };

      __mockGet.mockResolvedValueOnce({ 
        exists: true, 
        data: () => ({ createdBy: 'test-user-id' }) 
      });

      __mockCommit.mockResolvedValueOnce();

      await managerController.addPlayers(req, res);

      expect(__mockCollection).toHaveBeenCalledWith('teams');
      expect(__mockDoc).toHaveBeenCalledWith('test-team-id');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Players added successfully',
        players: expect.any(Array)
      });
    });

    it('should return error if team not found', async () => {
      req.body = { teamId: 'invalid-team-id', players: [] };
      __mockGet.mockResolvedValueOnce({ exists: false });

      await managerController.addPlayers(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Team not found' });
    });

    it('should return error if user is not team owner', async () => {
      req.body = { teamId: 'test-team-id', players: [] };
      __mockGet.mockResolvedValueOnce({ 
        exists: true, 
        data: () => ({ createdBy: 'different-user-id' }) 
      });

      await managerController.addPlayers(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Not authorized to add players to this team' 
      });
    });

    it('should handle errors when adding players', async () => {
      req.body = {
        teamId: 'test-team-id',
        players: [{ name: 'Player 1', position: 'Forward', number: 10, age: 25 }]
      };

      __mockGet.mockResolvedValueOnce({ 
        exists: true, 
        data: () => ({ createdBy: 'test-user-id' }) 
      });

      const error = new Error('Firestore error');
      __mockCommit.mockRejectedValueOnce(error);

      await managerController.addPlayers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Firestore error' });
    });
  });

  describe('myTeam', () => {
    it('should return team if exists', async () => {
      const mockTeam = { 
        teamId: 'test-team', 
        teamName: 'Test Team',
        createdBy: 'test-user-id'
      };

      __mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [{ data: () => mockTeam }]
      });

      await managerController.myTeam(req, res);

      expect(__mockCollection).toHaveBeenCalledWith('teams');
      expect(__mockWhere).toHaveBeenCalledWith('createdBy', '==', 'test-user-id');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        hasTeam: true, 
        team: mockTeam 
      });
    });

    it('should return hasTeam: false if no team exists', async () => {
      __mockGet.mockResolvedValueOnce({ empty: true });

      await managerController.myTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ hasTeam: false });
    });

    it('should handle errors when fetching team', async () => {
      const error = new Error('Firestore error');
      __mockGet.mockRejectedValueOnce(error);

      await managerController.myTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Firestore error' });
    });
  });
  
  
  describe('addPlayers - validation', () => {
    it('should return 400 if teamId or players missing', async () => {
      req.body = {}; 
      await managerController.addPlayers(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'teamId and players[] required' });
    });

    it('should return 400 if players is not an array', async () => {
      req.body = { teamId: '123', players: 'not-an-array' };
      await managerController.addPlayers(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'teamId and players[] required' });
    });
  });


  describe('getPlayers', () => {
    it('should return 404 if team not found', async () => {
      req.params.teamId = 'missing-team';
      __mockGet.mockResolvedValueOnce({ exists: false });

      await managerController.getPlayers(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Team not found' });
    });

    it('should return 403 if user is not authorized', async () => {
      req.params.teamId = 'team1';
      __mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ createdBy: 'different-user' }),
      });

      await managerController.getPlayers(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized to view players of this team' });
    });

    it('should return players if team belongs to user', async () => {
      req.params.teamId = 'team1';
      const mockPlayers = [
        { name: 'P1' },
        { name: 'P2' },
      ];

      __mockGet
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ createdBy: 'test-user-id' }),
        })
        .mockResolvedValueOnce({
          docs: mockPlayers.map(p => ({ data: () => p })),
        });

      await managerController.getPlayers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ players: mockPlayers });
    });

    it('should handle Firestore error in getPlayers', async () => {
      req.params.teamId = 'team1';
      const error = new Error('Firestore error');
      __mockGet.mockRejectedValueOnce(error);

      await managerController.getPlayers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Firestore error' });
    });
  });


  describe('removePlayer', () => {
    it('should return 404 if player not found', async () => {
      req.params.playerId = 'player1';
      __mockGet.mockResolvedValueOnce({ exists: false });

      await managerController.removePlayer(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Player not found' });
    });

    it('should return 404 if team for player not found', async () => {
      req.params.playerId = 'player1';
      __mockGet
        .mockResolvedValueOnce({ exists: true, data: () => ({ teamId: 'team1' }) })
        .mockResolvedValueOnce({ exists: false }); 

      await managerController.removePlayer(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Team not found' });
    });

    it('should return 403 if user not authorized to remove player', async () => {
      req.params.playerId = 'player1';
      __mockGet
        .mockResolvedValueOnce({ exists: true, data: () => ({ teamId: 'team1' }) }) 
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ createdBy: 'other-user' }),
        }); 

      await managerController.removePlayer(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not authorized to remove players from this team',
      });
    });

    it('should remove player successfully if authorized', async () => {
      req.params.playerId = 'player1';
      __mockGet
        .mockResolvedValueOnce({ exists: true, data: () => ({ teamId: 'team1' }) }) 
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ createdBy: 'test-user-id' }),
        }); 

      __mockDelete.mockResolvedValueOnce();

      await managerController.removePlayer(req, res);

      expect(__mockDelete).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Player removed successfully',
        playerId: 'player1',
      });
    });

    it('should handle Firestore error in removePlayer', async () => {
      req.params.playerId = 'player1';
      const error = new Error('Firestore error');
      __mockGet.mockRejectedValueOnce(error);

      await managerController.removePlayer(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Firestore error' });
    });
  });


});