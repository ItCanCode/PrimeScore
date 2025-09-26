import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import '../Styles/LiveAPI.css';
const LiveApi = () => {
  const API_KEY = "4399a3821d4ce5eb1a989436dc4e5303cf5e7176";
  
  // const selected_league = "Epl"; 
   const location = useLocation();

  const navigate = useNavigate();
  const selected_league_2=location.state.selected_league;
  console.log(location.state.selected_league);
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasFetched = useRef(false);
  const abortController = useRef(null);

  const fetchMatches = useCallback(async () => {
    const LEAGUE_IDS = {
      PSL: "296",
      serie_a: "253",
      Epl: "228",
      "premier-league": "228",
      La_liga: "297"
    };

    if (abortController.current) abortController.current.abort();
    abortController.current = new AbortController();
    hasFetched.current = true;
    setLoading(true);
    setError(null);

    try {
      
      // console.log(selected_league2);
      
      const league_id = LEAGUE_IDS[selected_league_2] || LEAGUE_IDS.Epl;
      const apiUrl = `https://api.soccerdataapi.com/matches/?league_id=${league_id}&season=2025-2026&auth_token=${API_KEY}`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Accept-Encoding": "gzip" },
        signal: abortController.current.signal
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !Array.isArray(data) || data.length === 0) {
        setMatches([]);
        return;
      }

      const allMatches = data[0]?.stage?.flatMap(stage => stage.matches) || [];
      if (allMatches.length === 0) {
        setMatches([]);
        return;
      }

      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);

      const filtered = allMatches.filter(match => {
        if (!match.date) return false;
        try {
          const [day, month, year] = match.date.split("/");
          const isoDate = `${year}-${month.padStart(2,"0")}-${day.padStart(2,"0")}`;
          const matchDate = new Date(isoDate);
          const homeTeamName=match.teams.home.name;
          const status=match.status;
          return matchDate >= sevenDaysAgo && matchDate <= today && homeTeamName!="None" && status=="finished";
        } catch {
          return false;
        }
      });

      setMatches(filtered);

    } catch (error) {
      if (error.name === 'AbortError') return;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [selected_league_2, API_KEY]);

  useEffect(() => {
    if (hasFetched.current) return;
    fetchMatches();
    return () => abortController.current?.abort();
  }, [fetchMatches]);

  useEffect(() => { hasFetched.current = false; }, [selected_league_2]);

  if (loading) {
    return (
      <div className="live-api-container">
        <div className="loading-container">
          <p className="loading-text">Loading {selected_league_2} matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="live-api-container">
        <div className="error-container" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>Unable to Load Matches</h3>
          <p>{error}</p>
          {error.includes('Rate limit') && (
            <div style={{ marginTop: '1rem' }}>
              <p>You've reached the API rate limit. Please wait a few minutes before trying again.</p>
              <button 
                onClick={() => {
                  hasFetched.current = false;
                  setError(null);
                  setLoading(true);
                  window.location.reload();
                }}
                style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="live-api-container">
        <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', color: '#0e0d0dff', cursor: 'pointer' }}>Back</button>
      <div className="live-api-header">
        <h2 className="live-api-title">{selected_league_2.toUpperCase()} Matches in the Last 7 Days</h2>
        <p className="live-api-subtitle">Recent football matches ({matches.length} matches found)</p>
      </div>
      
      {matches.length > 0 ? (
        <div className="matches-grid">
          {matches.map((match, index) => (
            <div key={match.id || index} className="match-card">
              <div className="match-header">
                <div className="match-teams">
                  <span className="team-name">{match.teams?.home?.name || "Unknown Home Team"}</span>
                  <span className="vs-text">VS</span>
                  <span className="team-name">{match.teams?.away?.name || "Unknown Away Team"}</span>
                </div>

                <div className="match-score">
                  <span className="home-score">{match.goals?.home_ft_goals ?? 0}</span>
                  <span className="dash"> - </span>
                  <span className="away-score">{match.goals?.away_ft_goals ?? 0}</span>
                </div>

                <div className="match-status">{match.status || "FINISHED"}</div>
              </div>

              <div className="match-info">
                <p className="match-datetime">
                  <span className="datetime-icon">🕒</span>
                  Kickoff:{" "}
                  {match.date && match.time
                    ? (() => {
                        try {
                          const [day, month, year] = match.date.split("/");
                          const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${match.time}:00`;
                          return new Date(isoDate).toLocaleString();
                        } catch {
                          return "Invalid Date";
                        }
                      })()
                    : "Date/Time not available"}
                </p>
                {match.venue && (
                  <p className="match-venue">
                    <span className="venue-icon">📍</span>
                    {match.venue}
                  </p>
                )}
              </div>

              {match.events && match.events.length > 0 && (
                <div className="events-section">
                  <h4 className="events-title">Match Events</h4>
                  <ul className="events-list">
                    {match.events.slice(0,match.events.length).map((event, eventIndex) => {
                      let playerName = "Unknown";
                      if (event.event_type === "substitution") {
                        const inName = event.player_in?.name || "Unknown";
                        const outName = event.player_out?.name || "Unknown";
                        playerName = `${outName} → ${inName}`;
                      } else {
                        playerName = event.player?.name || "Unknown";
                      }
                      return (
                        <li key={eventIndex} className="event-item">
                          <span className="event-minute">{event.event_minute}'</span>
                          <span className="event-type">{event.event_type}</span>
                          <span className="event-player">- {playerName}</span>
                        </li>
                      );
                    })}
                    {/* {match.events.length > 5 && (
                      <li className="event-item">
                        <span>... and {match.events.length - 5} more events</span>
                      </li>
                    )} */}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-matches">
          <div className="no-matches-icon">⚽</div>
          <p className="no-matches-text">No {selected_league_2} matches found in the last 7 days.</p>
          <p className="no-matches-subtitle">Try checking back later or selecting a different league.</p>
        </div>
      )}
    </div>
  );
};

export default LiveApi;