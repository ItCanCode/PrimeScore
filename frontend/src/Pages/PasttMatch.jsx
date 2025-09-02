import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "../Styles/LiveAPI.css";

const LiveApi = () => {
  // API Configuration
  const API_KEY = "4399a3821d4ce5eb1a989436dc4e5303cf5e7176";
  //const API_KEY="ffbf5998cd06786edb62bc17bd591e02649fdcfe" //new

  // Get navigation state
  const location = useLocation();
  const selected_league = location.state?.selected_league || "Epl";
  
  // Component state
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Prevent multiple API calls
  const hasFetched = useRef(false);
  const abortController = useRef(null);

  console.log("Component rendered, selected_league:", selected_league);

  const fetchMatches = useCallback(async () => {
    const LEAGUE_IDS = {
      PSL: "296",
      serie_a: "253", 
      Epl: "228",
      "premier-league": "228",
      La_liga: "297"
    };
    // Cancel any previous request
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    hasFetched.current = true;
    
    setLoading(true);
    setError(null);

    try {
      // Get league ID
      const league_id = LEAGUE_IDS[selected_league] || LEAGUE_IDS.Epl;
      console.log("Using league_id:", league_id);

      // Build API URL
      const apiUrl = `https://api.soccerdataapi.com/matches/?league_id=${league_id}&season=2025-2026&auth_token=${API_KEY}`;
      console.log("API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip",
        },
        signal: abortController.current.signal
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw API data structure:", {
        isArray: Array.isArray(data),
        length: data?.length,
        hasStage: data?.[0]?.stage ? true : false
      });

      // Check data structure
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn("No data or empty array returned");
        setMatches([]);
        return;
      }

      // Extract matches
      const allMatches = data[0]?.stage?.flatMap((stage) => stage.matches) || [];
      console.log("All matches found:", allMatches.length);

      if (allMatches.length === 0) {
        console.warn("No matches found in API response");
        setMatches([]);
        return;
      }

      // Get current date and 7 days ago
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);

      console.log("Date range:", {
        sevenDaysAgo: sevenDaysAgo.toISOString().split("T")[0],
        today: today.toISOString().split("T")[0]
      });

      // Filter matches in the past 7 days
      const filtered = allMatches.filter(match => {
        const matchDate = new Date(match.date); // assuming match.date is a valid date string
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        return matchDate >= sevenDaysAgo && matchDate <= now;
      });

      console.log("Filtered matches:", filtered.length);
      setMatches(filtered);

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("Request was aborted");
        return;
      }
      console.error("Error fetching matches:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [selected_league, API_KEY]);

  useEffect(() => {
    console.log("useEffect triggered, hasFetched:", hasFetched.current);
    
    // Prevent multiple calls
    if (hasFetched.current) {
      console.log("Already fetched, skipping...");
      return;
    }

    fetchMatches();

    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [fetchMatches]);


  useEffect(() => {
    hasFetched.current = false;
  }, [selected_league]);

  // Loading state
  if (loading) {
    return (
      <div className="live-api-container">
        <div className="loading-container">
          <p className="loading-text">Loading {selected_league} matches...</p>
        </div>
      </div>
    );
  }

  // Error state with rate limit handling
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

  // Main render
  return (
    <div className="live-api-container">
      <div className="live-api-header">
        <h2 className="live-api-title">
          {selected_league.toUpperCase()} Matches in the Last 7 Days
        </h2>
        <p className="live-api-subtitle">
          Recent football matches ({matches.length} matches found)
        </p>
      </div>
      
      {matches.length > 0 ? (
        <div className="matches-grid">
          {matches.map((match, index) => (
            <div key={match.id || index} className="match-card">
              <div className="match-header">
                <div className="match-teams">
                  <span className="team-name">
                    {match.teams?.home?.name || "Unknown Home Team"}
                  </span>
                  <span className="vs-text">VS</span>
                  <span className="team-name">
                    {match.teams?.away?.name || "Unknown Away Team"}
                  </span>
                </div>
                <div className="match-status">
                  {match.status || "FINISHED"}
                </div>
              </div>

              <div className="match-info">
                <p className="match-datetime">
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
                
                {/* Show score if available */}
                {match.score && (
                  <p className="match-score">
                    Score: {match.score.home || 0} - {match.score.away || 0}
                  </p>
                )}
              </div>

              {match.events && match.events.length > 0 && (
                <div className="events-section">
                  <h4 className="events-title">Match Events</h4>
                  <ul className="events-list">
                    {match.events.slice(0, 5).map((event, eventIndex) => {
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
                    {match.events.length > 5 && (
                      <li className="event-item">
                        <span>... and {match.events.length - 5} more events</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-matches">
          <div className="no-matches-icon">⚽</div>
          <p className="no-matches-text">
            No {selected_league} matches found in the last 7 days.
          </p>
          <p className="no-matches-subtitle">
            Try checking back later or selecting a different league.
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveApi;