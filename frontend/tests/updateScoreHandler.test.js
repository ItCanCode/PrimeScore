import { handleUpdateScore } from "../src/services/updateScoreHandler";
import { updateScoreService } from "../src/services/matchService";

jest.mock("../src/services/matchService", () => ({
  updateScoreService: jest.fn(),
}));

describe("handleUpdateScore", () => {
  let setMatches;
  let setMessage;

  const matchId = 1;
  const homeScore = 3;
  const awayScore = 2;
  const prevMatches = [
    { id: 1, homeScore: 0, awayScore: 0 },
    { id: 2, homeScore: 1, awayScore: 1 }
  ];

  beforeEach(() => {
    setMatches = jest.fn(cb => cb(prevMatches));
    setMessage = jest.fn();
    updateScoreService.mockClear();
  });

  it("updates scores optimistically and calls service", async () => {
    updateScoreService.mockResolvedValueOnce({ matchId, homeScore, awayScore });

    await handleUpdateScore(matchId, homeScore, awayScore, setMatches, setMessage);

    expect(setMatches).toHaveBeenCalled();
    expect(updateScoreService).toHaveBeenCalledWith(matchId, homeScore, awayScore);
    expect(setMessage).not.toHaveBeenCalled();
  });

  it("sets error message if service fails", async () => {
    const error = new Error("Network error");
    updateScoreService.mockRejectedValueOnce(error);

    await handleUpdateScore(matchId, homeScore, awayScore, setMatches, setMessage);

    expect(setMatches).toHaveBeenCalled();
    expect(setMessage).toHaveBeenCalledWith({ type: "error", text: "Network error" });
  });
});
