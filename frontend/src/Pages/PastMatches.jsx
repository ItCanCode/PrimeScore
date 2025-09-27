import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, Clock, MapPin, Trophy } from "lucide-react";

const PastMatches = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const sportType = location.state?.sport || null;
    useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(
          "https://prime-backend.azurewebsites.net/api/users/viewMatches"
        );
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Only past matches
  const pastMatches = matches.filter(
    (match) => (match.status || "").toLowerCase() === "finished"
  );

  // If sportType is set, filter further
  const filteredMatches = sportType
    ? pastMatches.filter((m) => m.sportType === sportType)
    : pastMatches;
    console.log(sportType)
  console.log(filteredMatches);
  const getSportIcon = (sport) => {
    switch (sport) {
      case "Football":
        return "⚽";
      case "Basketball":
        return "🏀";
      case "Cricket":
        return "🏏";
      default:
        return "🏆";
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${dateStr} at ${timeStr}`;
  };

  if (loading) {
    return (
      <div className="live-api-container">
        <div className="loading-container">
          <div className="loading-text">Loading past matches...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-api-container">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          border: "none",
          color: "#0e0d0dff",
          cursor: "pointer",
        }}
      >
        Back
      </button>

      {/* Header */}
      <div className="live-api-header">
        <h1 className="live-api-title">
          <Trophy size={36} style={{ verticalAlign: "middle", marginRight: "10px" }} />
          Past Matches
        </h1>
        <p className="live-api-subtitle">Review results of completed matches</p>
      </div>

      {/* Matches Grid */}
      {filteredMatches.length > 0 ? (
        <div className="matches-grid">
          {filteredMatches.map((match) => {
            const formattedDateTime = formatDateTime(match.startTime);

            return (
              <div key={match.id} className="match-card">
                {/* Header */}
                <div className="match-header">
                  <div className="match-teams">
                    <div className="team-name">{match.homeTeam}</div>
                    <div className="vs-text">VS</div>
                    <div className="team-name">{match.awayTeam}</div>
                  </div>
                  <div className="match-status">
                    {getSportIcon(match.sportType)} {match.status}
                  </div>
                </div>

                {/* Info */}
                <div className="match-info">
                  <div className="match-datetime">
                    <Calendar className="datetime-icon" />
                    <span>{formattedDateTime}</span>
                  </div>
                  <div className="match-venue">
                    <MapPin className="venue-icon" />
                    <span>{match.venue}</span>
                  </div>
                </div>

                {/* Sport Type Section */}
                <div className="events-section">
                  <div className="events-title">
                    <Trophy size={16} />
                    Sport: {match.sportType}
                  </div>
                  <div className="event-item">
                    <span className="event-type">Final Score</span>
                    <span className="event-player">
                      {match.homeTeam} {match.homeScore ?? "-"} : {match.awayScore ?? "-"}{" "}
                      {match.awayTeam}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-matches">
          <div className="no-matches-icon">🏆</div>
          <p className="no-matches-text">No past matches found</p>
        </div>
      )}
    </div>
  );
};

export default PastMatches;
