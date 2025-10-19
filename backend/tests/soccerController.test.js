import { getMatches } from "../src/controllers/soccerController.js"; 
import fetch from "node-fetch";

jest.mock("node-fetch", () => jest.fn());

describe("getMatches", () => {
  let req, res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
    process.env.SOCCER_API_KEY = "soccerkeyapi123";
  });

  it("should return matches when league_id is provided", async () => {
    req = { query: { league_id: "123", season: "2025-2026" } };

    const fakeApiResponse = {
      matches: [
        { id: 1, home_team: "Team A", away_team: "Team B" },
      ],
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeApiResponse,
    });

    await getMatches(req, res);

    expect(fetch).toHaveBeenCalledWith(
      `https://api.soccerdataapi.com/matches/?league_id=123&season=2025-2026&auth_token=soccerkeyapi123`
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeApiResponse);
  });

  it("should return 400 if league_id is missing", async () => {
    req = { query: {} };

    await getMatches(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "league_id is required" });
  });

  it("should handle API errors gracefully", async () => {
    req = { query: { league_id: "123" } };

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await getMatches(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch matches" });
  });

  it("should handle network or fetch errors", async () => {
    req = { query: { league_id: "123" } };

    fetch.mockRejectedValueOnce(new Error("Network Error"));

    await getMatches(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch matches" });
  });
});
