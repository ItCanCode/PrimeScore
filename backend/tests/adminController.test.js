// tests/adminController.test.js
import adminController from "../src/controllers/adminController.js";
import admin from "../src/config/firebaseAdmin.js";

// Mock Firebase Admin SDK
jest.mock("../src/config/firebaseAdmin.js", () => {
  const addMock = jest.fn();
  const collectionMock = {
    add: addMock,
  };
  const firestoreMock = {
    collection: jest.fn(() => collectionMock),
  };

  return {
    firestore: jest.fn(() => firestoreMock),
    __addMock: addMock,
    __collectionMock: collectionMock,
    __firestoreMock: firestoreMock,
  };
});

describe("adminController.createMatch", () => {
  let req, res, addMock;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    addMock = admin.__addMock;

    jest.clearAllMocks();
  });

  it("should create a match successfully", async () => {
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
    expect(addMock).toHaveBeenCalledWith({
      matchName: "Final",
      homeTeam: "Team A",
      awayTeam: "Team B",
      startTime: "2025-08-16T18:00:00Z",
      venue: "Stadium 1",
      sportType: "Soccer",
      status: "scheduled",
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Match created" });
  });

  it("should return 500 if Firestore throws an error", async () => {
    req.body = { matchName: "Final" };
    addMock.mockRejectedValue(new Error("Firestore error"));

    await adminController.createMatch(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Firestore error" });
  });
});
