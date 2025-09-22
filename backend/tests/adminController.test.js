// tests/adminController.test.js
import adminController from "../src/controllers/adminController.js";
import admin from "../src/config/firebaseAdmin.js";

// 🔹 Mock Firebase Admin
jest.mock("../src/config/firebaseAdmin.js", () => {
  const addMock = jest.fn();
  const updateMock = jest.fn();
  const getMock = jest.fn();
  const whereGetMock = jest.fn();

  const docMock = {
    get: getMock,
    update: updateMock,
  };

  const whereMock = jest.fn(() => ({
    get: whereGetMock,
  }));

  const collectionMock = {
    add: addMock,
    doc: jest.fn(() => docMock),
    get: getMock,
    where: whereMock,
  };

  const firestoreMock = {
    collection: jest.fn(() => collectionMock),
  };

  return {
    firestore: jest.fn(() => firestoreMock),
    __addMock: addMock,
    __updateMock: updateMock,
    __getMock: getMock,
    __whereGetMock: whereGetMock,
    __whereMock: whereMock,
    __docMock: docMock,
    __collectionMock: collectionMock,
    __firestoreMock: firestoreMock,
  };
});

describe("adminController", () => {
  let req, res, addMock, updateMock, getMock;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    addMock = admin.__addMock;
    updateMock = admin.__updateMock;
    getMock = admin.__getMock;

    jest.clearAllMocks();
  });

  // ---------------- CREATE MATCH ----------------
  it("createMatch: should create a match successfully", async () => {
    req.body = {
      matchName: "Final",
      homeTeam: "Team A",
      awayTeam: "Team B",
      startTime: "2025-08-16T18:00:00Z",
      venue: "Stadium 1",
      sportType: "Soccer",
    };

    addMock.mockResolvedValue({ id: "123" });

    await adminController.createMatch(req, res);

    expect(admin.__firestoreMock.collection).toHaveBeenCalledWith("matches");
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
      matchName: "Final",
      homeTeam: "Team A",
      awayTeam: "Team B",
      sportType: "Soccer",
      status: "scheduled",
    }));

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Match created" }));
  });

  it("createMatch: should return 500 on Firestore error", async () => {
    addMock.mockRejectedValue(new Error("Firestore error"));

    await adminController.createMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Firestore error" });
  });

  // ---------------- UPDATE MATCH STATUS ----------------
  it("updateMatchStatus: should update match status if match exists", async () => {
    req.params.id = "match1";
    req.body = { status: "ongoing" };

    getMock.mockResolvedValue({ exists: true });
    updateMock.mockResolvedValue();

    await adminController.updateMatchStatus(req, res);

    expect(updateMock).toHaveBeenCalledWith({ status: "ongoing" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Match status updated to ongoing" });
  });

  it("updateMatchStatus: should return 404 if match does not exist", async () => {
    req.params.id = "match1";
    req.body = { status: "finished" };

    getMock.mockResolvedValue({ exists: false });

    await adminController.updateMatchStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Match not found in matches collection" });
  });

  // ---------------- UPDATE SCORE ----------------
  it("updateScore: should update score in matches and ongoingMatches", async () => {
    req.params.id = "match1";
    req.body = { homeScore: 2, awayScore: 1 };

    getMock.mockResolvedValue({ exists: true });
    updateMock.mockResolvedValue();

    await adminController.updateScore(req, res);

    expect(updateMock).toHaveBeenCalledWith({ homeScore: 2, awayScore: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Score updated" });
  });

  it("updateScore: should add event if eventType is Goal", async () => {
    req.params.id = "match1";
    req.body = { homeScore: 3, awayScore: 2, eventType: "Goal", team: "Team A", player: "Player 1", time: "45'" };

    getMock.mockResolvedValue({ exists: true });
    updateMock.mockResolvedValue();
    addMock.mockResolvedValue({ id: "event123" });

    await adminController.updateScore(req, res);

    expect(admin.__firestoreMock.collection).toHaveBeenCalledWith("match_events");
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
      eventType: "Goal",
      team: "Team A",
      player: "Player 1",
      matchId: "match1",
    }));

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Score updated" });
  });

  // ---------------- ADD MATCH EVENT ----------------
  it("addMatchEvent: should add a match event successfully", async () => {
    req.params.id = "match1";
    req.body = { eventType: "Yellow Card", team: "Team B", player: "Player X", time: "60'" };

    addMock.mockResolvedValue({ id: "event123" });

    await adminController.addMatchEvent(req, res);

    expect(admin.__firestoreMock.collection).toHaveBeenCalledWith("match_events");
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
      eventType: "Yellow Card",
      team: "Team B",
      player: "Player X",
      time: "60'",
      matchId: "match1",
    }));

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Event added" });
  });

  // ---------------- ALL TEAMS ----------------
  describe("adminController - allTeams", () => {
    let req, res;

    beforeEach(() => {
      req = { query: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.clearAllMocks();
    });

    it("should return all teams when no sportType filter is applied", async () => {
      const mockTeams = [
        { id: "team1", teamName: "Team A", sportType: "Soccer" },
        { id: "team2", teamName: "Team B", sportType: "Rugby" },
      ];

      admin.__getMock.mockResolvedValue({
        empty: false,
        docs: mockTeams.map(team => ({
          id: team.id,
          data: () => ({ teamName: team.teamName, sportType: team.sportType }),
        })),
      });

      await adminController.allTeams(req, res);

      expect(admin.__firestoreMock.collection).toHaveBeenCalledWith("teams");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ teams: mockTeams });
    });

    it("should return filtered teams when sportType is provided", async () => {
      const mockTeams = [
        { id: "team1", teamName: "Soccer Team", sportType: "Soccer" },
      ];

      admin.__whereGetMock.mockResolvedValue({
        empty: false,
        docs: mockTeams.map(team => ({
          id: team.id,
          data: () => ({ teamName: team.teamName, sportType: team.sportType }),
        })),
      });

      req.query = { sportType: "Soccer" };
      await adminController.allTeams(req, res);

      expect(admin.__whereMock).toHaveBeenCalledWith("sportType", "==", "Soccer");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ teams: mockTeams });
    });

    it("should return empty array if no teams exist", async () => {
      admin.__getMock.mockResolvedValue({ empty: true });

      await adminController.allTeams(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ teams: [] });
    });

    it("should handle Firestore errors", async () => {
      admin.__getMock.mockRejectedValue(new Error("Firestore error"));

      await adminController.allTeams(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Firestore error" });
    });
  });

});
