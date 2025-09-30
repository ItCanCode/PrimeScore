import { handleUpdateMatchStatus } from "../src/services/updateMatchStatusService";
import { updateMatchStatusService } from "../src/services/matchService";

jest.mock("../src/services/matchService", () => ({
  updateMatchStatusService: jest.fn(),
}));

describe("handleUpdateMatchStatus", () => {
  let setMatches;
  let setMessage;

  const matchId = 1;
  const newStatus = "ongoing";
  const prevMatches = [
    { id: 1, status: "scheduled" },
    { id: 2, status: "scheduled" }
  ];

  beforeEach(() => {
    setMatches = jest.fn(cb => cb(prevMatches));
    setMessage = jest.fn();
    updateMatchStatusService.mockClear();
  });

  it("updates match status optimistically and calls service", async () => {
    updateMatchStatusService.mockResolvedValueOnce({ matchId, newStatus });

    await handleUpdateMatchStatus(matchId, newStatus, setMatches, setMessage);

    expect(setMatches).toHaveBeenCalled();
    expect(updateMatchStatusService).toHaveBeenCalledWith(matchId, newStatus);
    expect(setMessage).not.toHaveBeenCalled();
  });

  it("rolls back status and sets error message if service fails", async () => {
    const error = new Error("Network error");
    updateMatchStatusService.mockRejectedValueOnce(error);

    await handleUpdateMatchStatus(matchId, newStatus, setMatches, setMessage);

    expect(setMessage).toHaveBeenCalledWith({ type: "error", text: "Network error" });
    expect(setMatches).toHaveBeenCalledTimes(2);
  });
});
