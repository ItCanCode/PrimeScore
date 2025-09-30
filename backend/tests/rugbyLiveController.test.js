// tests/rugbyLiveController.test.js
import { rugbyLive, getRugbyFix } from "../src/controllers/rugbyLiveController.js";

// Mock firebaseAdmin ES module
jest.mock("../src/config/firebaseAdmin.js", () => {
  const batchSetMock = jest.fn();
  const batchCommitMock = jest.fn();

  return {
    __esModule: true,
    default: {
      firestore: () => ({
        batch: () => ({
          set: batchSetMock,
          commit: batchCommitMock,
        }),
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({ set: jest.fn() })),
          get: jest.fn(() => ({
            docs: [
              {
                id: "1",
                data: () => ({ teamA: "A", teamB: "B", date: { toDate: () => new Date("2025-09-30") } }),
              },
            ],
          })),
        })),
      }),
      __mocks: { batchSetMock, batchCommitMock }, // expose mocks for assertions
    },
  };
});

describe("rugbyLive controller", () => {
  let req, res, statusMock, jsonMock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    res = { status: statusMock };
    req = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should save fixtures successfully", async () => {
    const { default: admin } = await import("../src/config/firebaseAdmin.js");
    admin.__mocks.batchCommitMock.mockResolvedValueOnce();

    req.body = [{ teamA: "A", teamB: "B", date: new Date() }];

    await rugbyLive(req, res);

    expect(admin.__mocks.batchSetMock).toHaveBeenCalled();
    expect(admin.__mocks.batchCommitMock).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Fixtures saved successfully" });
  });

  it("should return 400 if no fixtures provided", async () => {
    req.body = [];
    await rugbyLive(req, res);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "No fixtures provided" });
  });

  it("should handle Firestore commit failure", async () => {
    const { default: admin } = await import("../src/config/firebaseAdmin.js");
    admin.__mocks.batchCommitMock.mockRejectedValueOnce(new Error("Firestore failure"));

    req.body = [{ teamA: "A", teamB: "B", date: new Date() }];
    await rugbyLive(req, res);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Failed to save fixtures" });
  });
});

describe("getRugbyFix controller", () => {
  let req, res, statusMock, jsonMock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    res = { status: statusMock };
    req = { params: {} };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch fixtures by date", async () => {
    req.params.date = "2025-09-30";
    await getRugbyFix(req, res);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      fixtures: [
        expect.objectContaining({
          id: "1",
          teamA: "A",
          teamB: "B",
          formattedDate: "2025-09-30",
        }),
      ],
    });
  });

  it("should return 400 if date not provided", async () => {
    req.params.date = "";
    await getRugbyFix(req, res);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Date is required" });
  });
});
