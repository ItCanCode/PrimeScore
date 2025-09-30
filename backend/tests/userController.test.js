import {
  getMatches,
  getCurrentUser,
  updateUser,
  uploadImage,
} from "../src/controllers/userController.js";

import cloudinary from "../src/config/cloudinary.js";

// Mock Firestore and Auth
jest.mock("../src/config/firebaseAdmin.js", () => {
  const mockGet = jest.fn();
  const mockUpdate = jest.fn();
  const mockDoc = jest.fn(() => ({
    get: mockGet,
    update: mockUpdate,
  }));
  const mockCollection = jest.fn(() => ({
    doc: mockDoc,
    get: mockGet,
  }));
  const mockVerifyIdToken = jest.fn();

  return {
    firestore: jest.fn(() => ({
      collection: mockCollection,
    })),
    auth: jest.fn(() => ({
      verifyIdToken: mockVerifyIdToken,
    })),
  };
});

// Mock Cloudinary
jest.mock("../src/config/cloudinary.js", () => ({
  uploader: {
    upload_stream: jest.fn((opts, cb) => {
      const fakeStream = {
        end: (buffer) => cb(null, { secure_url: "https://fakeurl.com/image.jpg" }),
      };
      return fakeStream;
    }),
  },
}));

let req;
let res;

beforeEach(() => {
  req = {
    params: {},
    body: {},
    headers: {},
    user: { uid: "user123" },
    file: null,
  };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  jest.clearAllMocks();
});

describe("UserController", () => {
  describe("getMatches", () => {
    it("should fetch matches and return 200", async () => {
      const { firestore } = await import("../src/config/firebaseAdmin.js");
      const db = firestore();
      db.collection().get.mockResolvedValueOnce({
        docs: [
          { id: "m1", data: () => ({ sportType: "Soccer" }) },
          { id: "m2", data: () => ({ sportType: "Basketball" }) },
        ],
      });

      await getMatches(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { id: "m1", sportType: "Soccer" },
        { id: "m2", sportType: "Basketball" },
      ]);
    });
  });

  describe("getCurrentUser", () => {
    it("should fetch current user data", async () => {
      req.headers.authorization = "Bearer fake-token";
      const { auth, firestore } = await import("../src/config/firebaseAdmin.js");
      auth().verifyIdToken.mockResolvedValueOnce({ uid: "user123" });
      firestore().collection().doc().get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ username: "Alice" }),
      });

      await getCurrentUser(req, res);

      expect(auth().verifyIdToken).toHaveBeenCalledWith("fake-token");
      expect(res.json).toHaveBeenCalledWith({ user: { username: "Alice" } });
    });

    it("should return 401 if no token", async () => {
      await getCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "No token" });
    });
  });

  describe("updateUser", () => {
    it("should update user profile successfully", async () => {
      req.body = {
        username: "Bob",
        picture: "pic.jpg",
        profile: {
          bio: "Hello",
          favoriteSports: ["Soccer", "Basketball"],
          favoriteTeam: "Real Madrid",
          favoritePlayer: "Ronaldo",
        },
      };

      const { firestore } = await import("../src/config/firebaseAdmin.js");
      firestore().collection().doc().get.mockResolvedValueOnce({ data: () => req.body });

      await updateUser(req, res);

      expect(firestore().collection().doc().update).toHaveBeenCalledWith({
        username: "Bob",
        picture: "pic.jpg",
        "profile.bio": "Hello",
        "profile.favoriteSports": ["Soccer", "Basketball"],
        "profile.favoriteTeam": "Real Madrid",
        "profile.favoritePlayer": "Ronaldo",
      });

      expect(res.json).toHaveBeenCalledWith({
        message: "Profile updated",
        user: req.body,
      });
    });

    it("should update profile with partial data", async () => {
      req.body = {
        username: "Bob",
        profile: {
          favoriteSports: [],
          favoriteTeam: "",
          favoritePlayer: "",
        },
      };

      const { firestore } = await import("../src/config/firebaseAdmin.js");
      firestore().collection().doc().get.mockResolvedValueOnce({ data: () => req.body });

      await updateUser(req, res);

      expect(firestore().collection().doc().update).toHaveBeenCalledWith({
        username: "Bob",
        "profile.favoriteSports": [],
        "profile.favoriteTeam": "",
        "profile.favoritePlayer": "",
      });

      expect(res.json).toHaveBeenCalledWith({
        message: "Profile updated",
        user: req.body,
      });
    });

    it("should return 500 on error", async () => {
      const { firestore } = await import("../src/config/firebaseAdmin.js");
      firestore().collection().doc().update.mockRejectedValueOnce(new Error("Failed"));

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed",
      });
    });
  });

  describe("uploadImage", () => {
    it("should upload file successfully", async () => {
      req.file = { originalname: "file.jpg", buffer: Buffer.from("test") };

      await uploadImage(req, res);

      expect(res.json).toHaveBeenCalledWith({ url: "https://fakeurl.com/image.jpg" });
    });

    it("should return 400 if no file provided", async () => {
      await uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No file uploaded" });
    });

    it("should return 500 if Cloudinary fails", async () => {
      req.file = { originalname: "file.jpg", buffer: Buffer.from("test") };
      cloudinary.uploader.upload_stream.mockImplementationOnce((opts, cb) => {
        const fakeStream = { end: () => cb(new Error("Upload failed"), null) };
        return fakeStream;
      });

      await uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Image upload failed" });
    });
  });
});
