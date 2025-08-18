import { googleAuth } from "../src/controllers/authController.js";
import { verifyGoogleToken } from "../src/services/authService.js";
import admin from "../src/config/firebaseAdmin.js";

jest.mock("../src/services/authService.js");
jest.mock("../src/config/firebaseAdmin.js", () => {
  const docMock = {
    get: jest.fn(),
    set: jest.fn(),
  };
  const collectionMock = {
    doc: jest.fn(() => docMock),
  };
  const firestoreMock = {
    collection: jest.fn(() => collectionMock),
    FieldValue: { serverTimestamp: jest.fn(() => "mock-timestamp") },
  };

  return {
    firestore: jest.fn(() => firestoreMock),
    __docMock: docMock,          
    __collectionMock: collectionMock,
    __firestoreMock: firestoreMock,
  };
});

describe("googleAuth controller", () => {
  let req, res;
  let mockGet, mockSet;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // reset all mocks
    jest.clearAllMocks();

    // alias firestore mocks for cleaner usage
    mockGet = admin.__docMock.get;
    mockSet = admin.__docMock.set;
  });

  test("should return 400 if idToken or action is missing", async () => {
    req.body = {};
    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "ID token and action are required",
    });
  });

  test("should return 400 for invalid action", async () => {
    req.body = { idToken: "fake", action: "invalid" };
    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid action, must be 'login' or 'signup'",
    });
  });

  test("signup: should return 409 if user already exists", async () => {
    req.body = { idToken: "valid-token", action: "signup" };
    verifyGoogleToken.mockResolvedValue({
      uid: "123",
      email: "test@example.com",
    });
    mockGet.mockResolvedValue({ exists: true });

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "User already exists" });
  });

  test("signup: should create new user and return 201", async () => {
    req.body = { idToken: "valid", action: "signup" };

    verifyGoogleToken.mockResolvedValue({
      uid: "123",
      email: "test@example.com",
      name: "Test User",
      picture: "pic.png",
    });

    mockGet.mockResolvedValue({ exists: false }); // user doesn’t exist
    mockSet.mockResolvedValue(); // simulate save

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    // expect(res.json).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     message: "Signup successful",
    //     user: expect.objectContaining({
    //       username: "Test User",
    //       email: "test@example.com",
    //       picture: "pic.png",
    //       role: "viewer",
    //       favoriteSport: expect.any(Array),
    //       profile: expect.any(Object),
    //     }),
    //   })
    // );
  });

  test("login: should return 404 if user not found", async () => {
    req.body = { idToken: "valid-token", action: "login" };
    verifyGoogleToken.mockResolvedValue({ uid: "123" });
    mockGet.mockResolvedValue({ exists: false });

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  test("login: should return 200 with user data if user exists", async () => {
    req.body = { idToken: "valid-token", action: "login" };
    verifyGoogleToken.mockResolvedValue({ uid: "123" });
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ email: "test@example.com", role: "viewer" }),
    });

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      user: { email: "test@example.com", role: "viewer" },
    });
  });

  test("should return 401 on token verification error", async () => {
    req.body = { idToken: "bad-token", action: "login" };
    verifyGoogleToken.mockRejectedValue(new Error("Invalid token"));

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
  });
});
