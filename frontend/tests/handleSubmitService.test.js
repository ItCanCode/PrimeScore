import { handleSubmitService } from "../src/services/handleSubmitService";
import { saveMatchService, fetchMatchesService } from "../src/services/matchService";

jest.mock("../src/services/matchService", () => ({
  saveMatchService: jest.fn(),
  fetchMatchesService: jest.fn(),
}));

describe("handleSubmitService", () => {
  let setMessage;
  let setMatches;
  let setEditingMatch;
  let setFormData;
  let setShowForm;

  const formData = {
    sportType: "Soccer",
    matchName: "Match 1",
    homeTeam: "A",
    awayTeam: "B",
    startTime: "2025-10-01T10:00",
    venue: "Stadium"
  };

  beforeEach(() => {
    setMessage = jest.fn();
    setMatches = jest.fn();
    setEditingMatch = jest.fn();
    setFormData = jest.fn();
    setShowForm = jest.fn();

    saveMatchService.mockClear();
    fetchMatchesService.mockClear();
  });

  it("creates a new match successfully", async () => {
    saveMatchService.mockResolvedValueOnce({});
    fetchMatchesService.mockResolvedValueOnce([{ id: 1, ...formData }]);

    await handleSubmitService(formData, null, setMessage, setMatches, setEditingMatch, setFormData, setShowForm);

    expect(saveMatchService).toHaveBeenCalledWith(formData, null);
    expect(setMessage).toHaveBeenCalledWith({ type: "success", text: "Match created successfully" });
    expect(fetchMatchesService).toHaveBeenCalled();
    expect(setMatches).toHaveBeenCalledWith([{ id: 1, ...formData }]);
    expect(setEditingMatch).toHaveBeenCalledWith(null);
    expect(setFormData).toHaveBeenCalledWith({ sportType: "", matchName: "", homeTeam: "", awayTeam: "", startTime: "", venue: "" });
    expect(setShowForm).toHaveBeenCalledWith(false);
  });

  it("updates an existing match successfully", async () => {
    saveMatchService.mockResolvedValueOnce({});
    fetchMatchesService.mockResolvedValueOnce([{ id: 1, ...formData }]);

    const editingMatch = { id: 1, ...formData };

    await handleSubmitService(formData, editingMatch, setMessage, setMatches, setEditingMatch, setFormData, setShowForm);

    expect(saveMatchService).toHaveBeenCalledWith(formData, editingMatch);
    expect(setMessage).toHaveBeenCalledWith({ type: "success", text: "Match updated successfully" });
  });

  it("sets error message if saveMatchService fails", async () => {
    const error = new Error("Network error");
    saveMatchService.mockRejectedValueOnce(error);

    await handleSubmitService(formData, null, setMessage, setMatches, setEditingMatch, setFormData, setShowForm);

    expect(setMessage).toHaveBeenCalledWith({ type: "error", text: "Network error" });
    expect(setFormData).toHaveBeenCalledWith({ sportType: "", matchName: "", homeTeam: "", awayTeam: "", startTime: "", venue: "" });
    expect(setShowForm).toHaveBeenCalledWith(false);
  });
});
