import React, { useEffect, useState } from "react";

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0];
}

const Upcoming = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, _setSelectedLeague] = useState("PSL");

  // create array of upcoming days
  const allowedDays = Array.from({ length: 17 }, (_, i) =>
    addDays(new Date(), i + 1)
  );
const SERIE_A = "253";
const EPL = "228";
const LA_LIGA = "297";
const PSL = "296";
// const sec_API = "9705bc4a7c3976dd88ceb3410db328363e8abd87";
const API_KEY = "4399a3821d4ce5eb1a989436dc4e5303cf5e7176";

// const new_api="ffbf5998cd06786edb62bc17bd591e02649fdcfe"
  const getLeagueId = (league) => {
    switch (league) {
      case "PSL":
        return PSL;
      case "Epl":
        return EPL;
      case "La_liga":
        return LA_LIGA;
      case "serie_a":
        return SERIE_A;
      default:
        return EPL;
    }
  };

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const league_id = getLeagueId(selectedLeague);

        const response = await fetch(
          `https://api.soccerdataapi.com/matches/?league_id=${league_id}&season=2025-2026&auth_token=${API_KEY}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept-Encoding": "gzip",
            },
          }
        );

        if (!response.ok) {
          console.error("Failed to fetch");
          setLoading(false);
          return;
        }

        const data = await response.json();
        const allMatches =
          data[0]?.stage?.flatMap((stage) => stage.matches) || [];

        const filtered = allMatches.filter((match) => {
          const [day, month, year] = match.date.split("/");
          const isoDate = `${year}-${month}-${day}T${match.time}:00`;
          const matchDate = new Date(isoDate).toISOString().split("T")[0];
          return allowedDays.includes(matchDate);
        });

        setMatches(filtered);
        console.log(filtered);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLive();
  }, [selectedLeague]); 

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Loading matches...</p>
      </div>
    );
  }

  return (
    <div className="live-api-container">
      <div className="live-api-header">
        <h2 className="live-api-title">Upcoming Matches</h2>
        <p className="live-api-subtitle">Next 17 days of {selectedLeague} fixtures</p>
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
              </div>
              
              <div className="match-info">
                <div className="match-datetime">
                  <span>🕒</span>
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
          <p className="no-matches-text">No matches found from {selectedLeague}.</p>
        </div>
      )}
    </div>
  );
};

export default Upcoming;