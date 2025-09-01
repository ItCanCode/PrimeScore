// tests/managerController.test.js
import managerController from "../src/controllers/managerController.js";

const mockSet = jest.fn();
const mockDoc = jest.fn(() => ({ set: mockSet, id: "mockTeamId", collection: mockCollection }));
const mockCollection = jest.fn(() => ({ doc: mockDoc }));
const mockBatchSet = jest.fn();
const mockCommit = jest.fn();
const mockBatch = jest.fn(() => ({ set: mockBatchSet, commit: mockCommit }));

// Mock admin.firestore
jest.mock("../src/config/firebaseAdmin.js", () => ({
  firestore: () => ({
    collection: mockCollection,
    batch: mockBatch,
  }),
}));

describe("managerController", () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("createTeam", () => {
    it("should create a team and return 201", async () => {
      const req = {
        body: {
          teamName: "Sharks",
          shortName: "SHK",
          sportType: "Soccer",
          city: "Cape Town",
        },
      };

      await managerController.createTeam(req, res);

      expect(mockCollection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({
        teamId: "mockTeamId",
        teamName: "Sharks",
        shortName: "SHK",
        sportType: "Soccer",
        city: "Cape Town",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Team created", teamId: "mockTeamId" });
    });
  });

  describe("addPlayers", () => {
    it("should add players to team and return 201", async () => {
      const req = {
        body: {
          teamId: "mockTeamId",
          players: ["Alice", "Bob"],
        },
      };

      await managerController.addPlayers(req, res);

      expect(mockCollection).toHaveBeenCalledWith("teams");
      expect(mockBatch).toHaveBeenCalled();
      expect(mockBatchSet).toHaveBeenCalledTimes(2); // one per player
      expect(mockCommit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Players added successfully" });
    });

    it("should return 400 if teamId or players[] missing", async () => {
      const req = { body: {} };
      await managerController.addPlayers(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "teamId and players[] required" });
    });
  });
});
