import React, { useEffect, useState } from "react";
import "../Styles/LiveAPI.css"; // Import the CSS file

// const sec_API = "9705bc4a7c3976dd88ceb3410db328363e8abd87";

const API_KEY = "4399a3821d4ce5eb1a989436dc4e5303cf5e7176";
const Psl_id = "296";
const serie_a = "253";
const Epl_id = "228";
const La_liga = "297";
const new_api="ffbf5998cd06786edb62bc17bd591e02649fdcfe"
// let selected_league = "Epl";
let league_id = "";

const LiveApi = ({selected_league}) => {


// const sec_API = "9705bc4a7c3976dd88ceb3410db328363e8abd87";

// const API_KEY = "4399a3821d4ce5eb1a989436dc4e5303cf5e7176";
const Psl_id = "296";
const serie_a = "253";
const Epl_id = "228";
const La_liga = "297";
// const new_api="ffbf5998cd06786edb62bc17bd591e02649fdcfe"
// let selected_league = "Epl";
let league_id = "";
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split("T")[0];
  }

  useEffect(() => {
    const fetchMatches = async () => {

      try {
        if (selected_league === "PSL") {
          league_id = Psl_id;
        } else if (selected_league === "Epl") {
          league_id = Epl_id;
        } else if (selected_league === "La_liga") {
          league_id = La_liga;
        } else if (selected_league === "serie_a") {
          league_id = serie_a;
        } else {
          league_id = Epl_id;
        }

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

        const allMatches = data[0]?.stage?.flatMap((stage) => stage.matches) || [];

        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) =>
          addDays(today, -i)
        );

        // Filter matches in the past 7 days
        const filtered = allMatches.filter((match) => {
          const [day, month, year] = match.date.split("/");
          const isoDate = `${year}-${month}-${day}T${match.time}:00`;
          const matchDate = new Date(isoDate).toISOString().split("T")[0];
          return last7Days.includes(matchDate);
        });

        setMatches(filtered);
        console.log(matches[0]);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [selected_league]);

  if (loading) {
    return (
      <div className="live-api-container">
        <div className="loading-container">
          <p className="loading-text">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-api-container">
      <div className="live-api-header">
        <h2 className="live-api-title"> Matches in the Last 7 Days</h2>
        <p className="live-api-subtitle">Recent football matches and live updates</p>
      </div>
      
      {matches.length > 0 ? (
        <div className="matches-grid">
          {matches.map((m) => (
            <div key={m.id} className="match-card">
              <div className="match-header">
                <div className="match-teams">
                  <span className="team-name">
                    {m.teams.home?.name || "Unknown"}
                  </span>
                  <span className="vs-text">VS</span>
                  <span className="team-name">
                    {m.teams.away?.name || "Unknown"}
                  </span>
                </div>
                <div className="match-status">FINISHED</div>
              </div>

              <div className="match-info">
                <p className="match-datetime">
                   Kickoff:{" "}
                  {m.date && m.time
                    ? new Date(
                        `${m.date.split("/")[2]}-${m.date.split("/")[1]}-${m.date.split("/")[0]}T${m.time}:00`
                      ).toLocaleString()
                    : "Invalid Date"}
                </p>
              </div>

              {m.events?.length > 0 && (
                <div className="events-section">
                  <h4 className="events-title"> Match Events</h4>
                  <ul className="events-list">
                    {m.events.map((e, i) => {
                      let playerName = "Unknown";

                      if (e.event_type === "substitution") {
                        const inName = e.player_in?.name || "Unknown";
                        const outName = e.player_out?.name || "Unknown";
                        playerName = `${outName} → ${inName}`;
                      } else {
                        playerName = e.player?.name || "Unknown";
                      }

                      return (
                        <li key={i} className="event-item">
                          <span className="event-minute">{e.event_minute}'</span>
                          <span className="event-type">{e.event_type}</span>
                          <span className="event-player">- {playerName}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-matches">
          <div className="no-matches-icon">⚽</div>
          <p className="no-matches-text">No matches found in the last 7 days.</p>
        </div>
      )}
    </div>
  );
};

export default LiveApi;