import { handleDeleteMatch } from "../src/services/deleteMatchHandler";
import { deleteMatchService } from "../src/services/matchService";

jest.mock("../src/services/matchService", () => ({
  deleteMatchService: jest.fn(),
}));

const originalConfirm = window.confirm;

describe("handleDeleteMatch", () => {
  let setMatches;
  let setMessage;

  beforeEach(() => {
    setMatches = jest.fn();
    setMessage = jest.fn();
    deleteMatchService.mockClear();
    window.confirm = jest.fn(() => true); 
  });

  afterAll(() => {
    window.confirm = originalConfirm; 
  });

  it("calls deleteMatchService and updates state on confirmation", async () => {
    deleteMatchService.mockResolvedValueOnce({ matchId: 1 });

    const prevMatches = [{ id: 1 }, { id: 2 }];
    setMatches.mockImplementation(cb => cb(prevMatches));

    await handleDeleteMatch(1, setMatches, setMessage);

    expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to delete this match?");
    expect(deleteMatchService).toHaveBeenCalledWith(1);
    expect(setMatches).toHaveBeenCalledWith(expect.any(Function));
    expect(setMessage).toHaveBeenCalledWith({ type: "success", text: "Match deleted successfully" });
  });

  it("does nothing if user cancels confirmation", async () => {
    window.confirm = jest.fn(() => false);

    await handleDeleteMatch(1, setMatches, setMessage);

    expect(deleteMatchService).not.toHaveBeenCalled();
    expect(setMatches).not.toHaveBeenCalled();
    expect(setMessage).not.toHaveBeenCalled();
  });

  it("sets error message if deleteMatchService fails", async () => {
    const error = new Error("Network error");
    deleteMatchService.mockRejectedValueOnce(error);

    await handleDeleteMatch(1, setMatches, setMessage);

    expect(setMessage).toHaveBeenCalledWith({ type: "error", text: "Network error" });
  });
});
