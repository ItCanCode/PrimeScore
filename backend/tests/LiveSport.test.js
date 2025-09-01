import LiveSport from '../src/controllers/matchController.js';
import admin from '../src/config/firebaseAdmin.js';

const mockSet = jest.fn();
const mockCommit = jest.fn();
const mockDoc = jest.fn(() => ({ set: mockSet }));
const mockCollection = jest.fn(() => ({
  doc: mockDoc,
}));

jest.mock('../src/config/firebaseAdmin.js', () => ({
  firestore: jest.fn(() => ({
    collection: mockCollection,
    batch: jest.fn(() => ({
      set: mockSet,
      commit: mockCommit.mockResolvedValueOnce(),
    })),
  })),
}));

const mockReq = (body = {}) => ({ body });
const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('LiveSport controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('adds matches successfully', async () => {
    const req = mockReq({
      matches: [
        { id: 1, home: 'Team A', away: 'Team B', time: '13:00', date: '2025-09-01' },
      ],
    });
    const res = mockRes();

    await LiveSport(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Matches added successfully' });
    expect(mockCollection).toHaveBeenCalledWith('Upcoming_Matches');
    expect(mockCommit).toHaveBeenCalled();
  });

  test('returns 400 if no matches', async () => {
    const req = mockReq({ matches: [] });
    const res = mockRes();

    await LiveSport(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'No matches to store' });
  });
});
