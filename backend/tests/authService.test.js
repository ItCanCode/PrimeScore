// tests/authService.test.js
import { verifyGoogleToken } from "../src/services/authService.js";
import admin from "../src/config/firebaseAdmin.js";

// Mock admin.auth().verifyIdToken
const mockVerifyIdToken = jest.fn();

jest.mock("../src/config/firebaseAdmin.js", () => ({
  auth: () => ({
    verifyIdToken: mockVerifyIdToken,
  }),
}));

describe("verifyGoogleToken service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return decoded token when verification succeeds", async () => {
    const fakeDecodedToken = { uid: "123", email: "test@example.com" };
    mockVerifyIdToken.mockResolvedValue(fakeDecodedToken);

    const result = await verifyGoogleToken("valid-token");

    expect(mockVerifyIdToken).toHaveBeenCalledWith("valid-token");
    expect(result).toEqual(fakeDecodedToken);
  });

  test("should throw an error when verification fails", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("Token invalid"));

    await expect(verifyGoogleToken("bad-token")).rejects.toThrow(
      "Invalid Google token"
    );
    expect(mockVerifyIdToken).toHaveBeenCalledWith("bad-token");
  });
});
