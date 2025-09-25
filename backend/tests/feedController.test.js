// tests/feedController.test.js
jest.mock("../src/config/firebaseAdmin.js", () => {
  const mockSet = jest.fn();
  const mockUpdate = jest.fn();
  const mockGet = jest.fn();

  const mockDoc = jest.fn(() => ({
    set: mockSet,
    update: mockUpdate,
    get: mockGet,
  }));

  const mockCollection = jest.fn(() => ({
    doc: mockDoc,
  }));

  const mockFirestore = jest.fn(() => ({
    collection: mockCollection,
  }));

  mockFirestore.FieldValue = {
    arrayUnion: jest.fn((...args) => ({ type: "arrayUnion", args })),
    increment: jest.fn((n) => ({ type: "increment", value: n })),
    serverTimestamp: jest.fn(() => ({ type: "serverTimestamp" })),
  };

  return {
    firestore: mockFirestore,
    __mockSet: mockSet,
    __mockUpdate: mockUpdate,
    __mockGet: mockGet,
    __mockDoc: mockDoc,
    __mockCollection: mockCollection,
    __mockArrayUnion: mockFirestore.FieldValue.arrayUnion,
    __mockIncrement: mockFirestore.FieldValue.increment,
    __mockServerTimestamp: mockFirestore.FieldValue.serverTimestamp,
  };
});

import admin from "../src/config/firebaseAdmin.js";
import { startMatch, addEvent } from "../src/controllers/feedController.js";

const {
  __mockSet,
  __mockUpdate,
  __mockGet,
  __mockDoc,
  __mockCollection,
} = admin;

describe("feedController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = { status: jest.fn(() => res), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe("startMatch", () => {
    it("should start a match successfully", async () => {
      req.params.matchId = "m1";
      __mockSet.mockResolvedValueOnce();

      await startMatch(req, res);

      expect(__mockCollection).toHaveBeenCalledWith("matchEvents");
      expect(__mockDoc).toHaveBeenCalledWith("m1");
      expect(__mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          homeScore: 0,
          awayScore: 0,
          isRunning: true,
          period: 1,
          events: [],
          createdAt: { type: "serverTimestamp" },
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Match started!",
      });
    });

    it("should handle Firestore errors", async () => {
      req.params.matchId = "m1";
      __mockSet.mockRejectedValueOnce(new Error("fail"));

      await startMatch(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to start match" });
    });
  });

  describe("addEvent", () => {
    it("should require eventType, team, and time", async () => {
      req.params.matchId = "m1";
      req.body = { team: "home" }; // missing eventType + time

      await addEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "eventType, team, and time are required",
      });
    });

    it("should return 404 if match not found", async () => {
      req.params.matchId = "m1";
      req.body = { eventType: "goal", team: "home", time: 12 };
      __mockGet.mockResolvedValueOnce({ exists: false });

      await addEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Match not found" });
    });

    it("should add an event and update score for home team", async () => {
      req.params.matchId = "m1";
      req.body = { eventType: "goal", team: "home", time: 10, points: 1, player: "Bob" };
      __mockGet.mockResolvedValueOnce({ exists: true });
      __mockUpdate.mockResolvedValueOnce();

      await addEvent(req, res);

      expect(__mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          events: { type: "arrayUnion", args: [expect.any(Object)] },
          homeScore: { type: "increment", value: 1 },
          updatedAt: { type: "serverTimestamp" },
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: "Event recorded!" })
      );
    });

    it("should handle Firestore errors", async () => {
      req.params.matchId = "m1";
      req.body = { eventType: "goal", team: "home", time: 15 };
      __mockGet.mockResolvedValueOnce({ exists: true });
      __mockUpdate.mockRejectedValueOnce(new Error("fail"));

      await addEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to record event" });
    });
  });
});
