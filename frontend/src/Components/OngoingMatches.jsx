
// OngoingMatches.jsx
// Displays ongoing matches with live score, fouls, and substitutions.
// Fetches data from backend API and polls for updates.

import React, { useEffect, useState } from 'react';
import { Award, Flag, User, RefreshCw } from 'lucide-react';

// Main component
const OngoingMatches = () => {
  // State to hold ongoing matches
  const [matches, setMatches] = useState([]);
  // State to indicate loading
  const [loading, setLoading] = useState(true);
  // State for error handling
  const [error, setError] = useState(null);

  // Function to fetch ongoing matches from backend
  const fetchOngoingMatches = async () => {
    try {
      setLoading(true);
      setError(null);
  const response = await fetch('/api/display/display-matches');
  if (!response.ok) throw new Error('Failed to fetch matches');
  const data = await response.json();
  // The backend returns an array, not an object with a 'matches' property
  setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Poll for updates every 5 seconds
  useEffect(() => {
    fetchOngoingMatches();
    const interval = setInterval(fetchOngoingMatches, 5000);
    return () => clearInterval(interval);
  }, []);

  // Helper to extract score, fouls, substitutions from match events
  const getMatchStats = (events = []) => {
    // Default values
    let homeScore = 0, awayScore = 0;
    let fouls = [];
    let substitutions = [];

    // Loop through events to extract info
    events.forEach(event => {
      if (event.type === 'score') {
        // Example: { type: 'score', home: 1, away: 0 }
        if (typeof event.home === 'number') homeScore = event.home;
        if (typeof event.away === 'number') awayScore = event.away;
      }
      if (event.type === 'foul') {
        fouls.push(event);
      }
      if (event.type === 'substitution') {
        substitutions.push(event);
      }
    });
    return { homeScore, awayScore, fouls, substitutions };
  };

  // Render loading, error, or matches
  if (loading) {
    return (
      <div className="ongoing-matches-loading">
        <RefreshCw className="spin" /> Loading ongoing matches...
      </div>
    );
  }

  if (error) {
    return <div className="ongoing-matches-error">Error: {error}</div>;
  }

  if (!matches.length) {
    return <div className="ongoing-matches-empty">No ongoing matches at the moment.</div>;
  }

  return (
    <div className="ongoing-matches-list">
      <h2>Ongoing Matches</h2>
      {matches.map(match => {
        // Extract stats from events
        const { homeScore, awayScore, fouls, substitutions } = getMatchStats(match.events);
        return (
          <div key={match.id} className="ongoing-match-card">
            <h3>{match.homeTeam} vs {match.awayTeam}</h3>
            <div className="match-score">
              <span className="score-home">{homeScore}</span>
              <span> - </span>
              <span className="score-away">{awayScore}</span>
            </div>
            <div className="match-details">
              <div className="match-fouls">
                <strong>Fouls:</strong>
                {fouls.length ? (
                  <ul>
                    {fouls.map((foul, idx) => (
                      <li key={idx}>{foul.player} ({foul.team}) - {foul.description || 'Foul'}</li>
                    ))}
                  </ul>
                ) : (
                  <span> None</span>
                )}
              </div>
              <div className="match-subs">
                <strong>Substitutions:</strong>
                {substitutions.length ? (
                  <ul>
                    {substitutions.map((sub, idx) => (
                      <li key={idx}>{sub.playerOut} → {sub.playerIn} ({sub.team})</li>
                    ))}
                  </ul>
                ) : (
                  <span> None</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OngoingMatches;
