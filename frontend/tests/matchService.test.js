import {
  addMatchEventService,
  saveMatchService,
  startMatchService,
  fetchMatchesService,
  updateMatchStatusService,
  updateScoreService,
  deleteMatchService,
  fetchTeams,
  fetchMatches,
  fetchLiveStats
} from "../src/services/matchService";

global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

describe("matchService", () => {
  it("adds a goal event", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    const result = await addMatchEventService(
      { id: 1 },
      { eventType: "Goal", team: "home", time: "12:00", player: "John" }
    );

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/feed/1/event"),
      expect.objectContaining({ method: "POST" })
    );
    expect(result).toMatchObject({
      eventType: "Goal",
      points: 1,
      team: "home",
      player: "John"
    });
  });

  it("throws if saveMatchService formData invalid", async () => {
    await expect(saveMatchService({}, null)).rejects.toThrow("Please fill in all fields");
  });

  it("saves a match successfully", async () => {
    const fakeMatch = { sportType: "Soccer", matchName: "Test", homeTeam: "A", awayTeam: "B", startTime: "2025-10-01", venue: "Stadium" };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...fakeMatch, id: 99 })
    });

    const data = await saveMatchService(fakeMatch, null);
    expect(data).toHaveProperty("id", 99);
  });

  it("starts match after scheduled time", async () => {
    const match = { id: 1, startTime: new Date(Date.now() - 1000).toISOString() };
    const updateMatchStatus = jest.fn();
    const setMessage = jest.fn();

    fetch.mockResolvedValueOnce({ ok: true });

    await startMatchService(match, updateMatchStatus, setMessage);

    expect(updateMatchStatus).toHaveBeenCalledWith(1, "ongoing");
    expect(setMessage).toHaveBeenCalledWith({ type: "success", text: "Match started successfully!" });
  });

  it("fetches matches", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, homeScore: 2, awayScore: 3 }]
    });

    const matches = await fetchMatchesService();
    expect(matches[0]).toMatchObject({ id: 1, homeScore: 2, awayScore: 3 });
  });

  it("updates match status", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    const result = await updateMatchStatusService(1, "finished");
    expect(result).toEqual({ matchId: 1, newStatus: "finished" });
  });

  it("updates score", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    const result = await updateScoreService(1, 2, 3);
    expect(result).toEqual({ matchId: 1, homeScore: 2, awayScore: 3 });
  });

  it("deletes a match", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    const result = await deleteMatchService(1);
    expect(result).toEqual({ matchId: 1 });
  });

  it("fetches teams", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ teams: [{ id: 1, teamName: "Team A" }] })
    });

    const teams = await fetchTeams();
    expect(teams).toEqual([{ id: 1, name: "Team A" }]);
  });

  it("fetches live stats", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ matchId: 1 }]
    });

    const stats = await fetchLiveStats();
    expect(stats).toEqual([{ matchId: 1 }]);
  });
});
