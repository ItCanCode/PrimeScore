import {
  getMatches,
  getCurrentUser,
  updateUser,
  uploadImage,
} from "../src/controllers/userController.js";

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

jest.mock("../src/config/cloudinary.js", () => ({
  uploader: {
    upload_stream: jest.fn((options, cb) => {
      const stream = {
        end: jest.fn(() =>
          cb(null, { secure_url: "https://cloudinary.com/test.jpg" })
        ),
      };
      return stream;
    }),
  },
}));

import admin from "../src/config/firebaseAdmin.js";
import cloudinary from "../src/config/cloudinary.js";

let req;
let res;

beforeEach(() => {
  req = {
    params: {},
    body: {},
    headers: {},
    user: { uid: "user123" },
  };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  jest.clearAllMocks();
});

describe("UserController", () => {

  describe("getMatches", () => {
    it("should fetch matches successfully", async () => {
      const db = admin.firestore();
      db.collection().get.mockResolvedValueOnce({
        docs: [
          { id: "m1", data: () => ({ sportType: "Soccer" }) },
          { id: "m2", data: () => ({ sportType: "Rugby" }) },
        ],
      });

      await getMatches(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { id: "m1", sportType: "Soccer" },
        { id: "m2", sportType: "Rugby" },
      ]);
    });

    it("should handle Firestore errors", async () => {
      const db = admin.firestore();
      db.collection().get.mockRejectedValueOnce(new Error("Firestore failed"));

      await getMatches(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Firestore failed" });
    });
  });

  describe("getCurrentUser", () => {
    it("should fetch current user data when valid token", async () => {
      req.headers.authorization = "Bearer test-token";
      admin.auth().verifyIdToken.mockResolvedValueOnce({ uid: "user123" });

      const db = admin.firestore();
      db.collection().doc().get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ username: "Alice" }),
      });

      await getCurrentUser(req, res);

      expect(admin.auth().verifyIdToken).toHaveBeenCalledWith("test-token");
      expect(res.json).toHaveBeenCalledWith({ user: { username: "Alice" } });
    });

    it("should return 401 if no token", async () => {
      await getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "No token" });
    });

    it("should return 404 if user not found", async () => {
      req.headers.authorization = "Bearer test-token";
      admin.auth().verifyIdToken.mockResolvedValueOnce({ uid: "user123" });

      const db = admin.firestore();
      db.collection().doc().get.mockResolvedValueOnce({ exists: false });

      await getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should handle internal error", async () => {
      req.headers.authorization = "Bearer test-token";
      admin.auth().verifyIdToken.mockRejectedValueOnce(
        new Error("Token invalid")
      );

      await getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch user",
      });
    });
  });

  describe("updateUser", () => {
    it("should update full user profile", async () => {
      req.body = {
        username: "Bob",
        picture: "pic.jpg",
        profile: {
          bio: "Hi there",
          location: "London",
          favoriteSports: ["Soccer"],
          favoriteTeam: "Arsenal",
          favoritePlayer: "Saka",
        },
      };

      const db = admin.firestore();
      db.collection().doc().get.mockResolvedValueOnce({
        data: () => req.body,
      });

      await updateUser(req, res);

      expect(db.collection().doc().update).toHaveBeenCalledWith({
        username: "Bob",
        picture: "pic.jpg",
        "profile.bio": "Hi there",
        "profile.location": "London",
        "profile.favoriteSports": ["Soccer"],
        "profile.favoriteTeam": "Arsenal",
        "profile.favoritePlayer": "Saka",
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "Profile updated",
        user: req.body,
      });
    });

    it("should update partial data", async () => {
      req.body = {
        username: "Charlie",
        profile: { favoriteSports: [], favoriteTeam: "" },
      };

      const db = admin.firestore();
      db.collection().doc().get.mockResolvedValueOnce({ data: () => req.body });

      await updateUser(req, res);

      expect(db.collection().doc().update).toHaveBeenCalledWith({
        username: "Charlie",
        "profile.favoriteSports": [],
        "profile.favoriteTeam": "",
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "Profile updated",
        user: req.body,
      });
    });

    it("should handle Firestore update error", async () => {
      const db = admin.firestore();
      db.collection().doc().update.mockRejectedValueOnce(new Error("Failed"));

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed" });
    });
  });


  describe("uploadImage", () => {
    it("should upload an image successfully", async () => {
      req.file = { originalname: "test.jpg", buffer: Buffer.from("fake") };

      await uploadImage(req, res);

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        url: "https://cloudinary.com/test.jpg",
      });
    });

    it("should return 400 if no file uploaded", async () => {
      req.file = null;
      await uploadImage(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No file uploaded" });
    });

    it("should handle Cloudinary upload failure", async () => {
      cloudinary.uploader.upload_stream.mockImplementationOnce(
        (options, cb) => {
          const stream = {
            end: jest.fn(() => cb(new Error("Cloudinary failed"))),
          };
          return stream;
        }
      );

      req.file = { originalname: "fail.jpg", buffer: Buffer.from("fake") };

      await uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Image upload failed" });
    });
  });
});
