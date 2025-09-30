import { 
  getSports,
  getFootballLeagues,
  getLeaguesForSport,
  mapLeagueParam,
  getMatchTypeNavigation
} from "../src/services/sportService";

describe("sportService utilities", () => {
  it("returns the list of sports", () => {
    const sports = getSports();
    expect(sports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "football", name: "Football" }),
        expect.objectContaining({ id: "netball", name: "Netball" }),
        expect.objectContaining({ id: "rugby", name: "Rugby" }),
      ])
    );
  });

  it("returns football leagues", () => {
    const leagues = getFootballLeagues();
    expect(leagues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "premier-league", name: "Premier League" }),
        expect.objectContaining({ id: "serie_a", name: "Serie A" }),
        expect.objectContaining({ id: "PSL", name: "PSL" }),
      ])
    );
  });

  it("returns leagues for a given sport", () => {
    expect(getLeaguesForSport("football")).toHaveLength(4);
    expect(getLeaguesForSport("rugby")).toHaveLength(2);
    expect(getLeaguesForSport("netball")).toHaveLength(3);
    expect(getLeaguesForSport("unknown")).toEqual([]);
  });

  it("maps league parameters correctly", () => {
    expect(mapLeagueParam("premier-league")).toBe("Epl");
    expect(mapLeagueParam("serie_a")).toBe("serie_a");
    expect(mapLeagueParam("PSL")).toBe("PSL");
    expect(mapLeagueParam("local-leagues")).toBe("local-leagues");
  });

  describe("getMatchTypeNavigation", () => {
    it("returns correct path for local-leagues", () => {
      const nav = getMatchTypeNavigation("local-leagues", "upcoming", "football");
      expect(nav).toEqual({
        path: "/upcoming",
        state: { sport: "football" }
      });
    });

    it("returns correct path for live match types and non-rugby sport", () => {
      const nav = getMatchTypeNavigation("premier-league", "upcoming", "football");
      expect(nav).toEqual({
        path: "/live/upcoming",
        state: { selected_league: "premier-league", sport: "football" }
      });
    });

    it("returns fallback path for unhandled cases", () => {
      const nav = getMatchTypeNavigation("unknown-league", "otherType", "rugby");
      expect(nav).toEqual({
        path: "/past",
        state: { selected_league: "unknown-league", sport: "rugby" }
      });
    });
  });
});
