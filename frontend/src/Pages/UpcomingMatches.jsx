import React, { useEffect, useState } from "react";
import "../Styles/LiveAPI.css";

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0];
}

const Upcoming = ({ selected_league }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upcoming 17 days
  const allowedDays = Array.from({ length: 17 }, (_, i) =>
    addDays(new Date(), i + 1)
  );

  // League IDs
  const LEAGUE_IDS = {
    PSL: "296",
    Epl: "228",
    La_liga: "297",
    serie_a: "253",
  };

  const API_KEY = "4399a3821d4ce5eb1a989436dc4e5303cf5e7176";

  const getLeagueId = (league) => LEAGUE_IDS[league] || LEAGUE_IDS.Epl;

  useEffect(() => {
    const fetchLive = async () => {
      setLoading(true);
      try {
        const league_id = getLeagueId(selected_league);
        const response = await fetch(
          `https://api.soccerdataapi.com/matches/?league_id=${league_id}&season=2025-2026&auth_token=${API_KEY}`
        );

        if (!response.ok) {
          console.error("Failed to fetch matches");
          setMatches([]);
          return;
        }

        const data = await response.json();
        const allMatches =
          data[0]?.stage?.flatMap((stage) => stage.matches) || [];

        const filtered = allMatches.filter((match) => {
          if (!match.date) return false;
          const [day, month, year] = match.date.split("/");
          const isoDate = `${year}-${month}-${day}T${match.time}:00`;
          const matchDate = new Date(isoDate).toISOString().split("T")[0];
          return allowedDays.includes(matchDate);
        });

        setMatches(filtered);
      } catch (error) {
        console.error("Error fetching matches:", error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLive();
  }, [selected_league]);

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Loading {selected_league} matches...</p>
      </div>
    );
  }

  return (
    <div className="live-api-container">
      <div className="live-api-header">
        <h2 className="live-api-title">Upcoming Matches</h2>
        <p className="live-api-subtitle">
          Next 17 days of {selected_league} fixtures
        </p>
      </div>

      {matches.length > 0 ? (
        <div className="matches-grid">
          {matches.map((m) => (
            <div key={m.id} className="match-card">
              <div className="match-header">
                <div className="match-teams">
                  <span className="team-name">{m.teams.home?.name || "Unknown"}</span>
                  <span className="vs-text">vs</span>
                  <span className="team-name">{m.teams.away?.name || "Unknown"}</span>
                </div>

                {/* Score below team names */}
                <div className="match-score-teams">
                  <span className="home-score">
                    {m.goals?.home_ft_goals ?? 0}
                  </span>
                  <span className="dash"> - </span>
                  <span className="away-score">
                    {m.goals?.away_ft_goals ?? 0}
                  </span>
                </div>
              </div>

              <div className="match-info">
                <div className="match-datetime">
                  🕒{" "}
                  {m.date && m.time
                    ? new Date(
                        `${m.date.split("/")[2]}-${m.date.split("/")[1]}-${
                          m.date.split("/")[0]
                        }T${m.time}:00`
                      ).toLocaleString()
                    : "Invalid Date"}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-matches">
          <div className="no-matches-icon">⚽</div>
          <p className="no-matches-text">No matches found from {selected_league}.</p>
        </div>
      )}
    </div>
  );
};

export default Upcoming;
