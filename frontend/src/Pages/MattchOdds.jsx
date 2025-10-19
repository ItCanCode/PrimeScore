
import React, { useEffect, useState } from "react";
import '../Styles/MatchOdds.css';

const MatchOdds = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(
          "https://theinvinciblesprojects-3tv1.onrender.com/exposed/api/predictions"
        );
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error("Error fetching match odds:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="home loading-container">
        <div className="loading-text">Loading match odds...</div>
      </div>
    );
  }

  return (
    <div className="home match-odds-container">
      <section className="hero" id="match-odds">
        <div className="hero-content">
          <h2 className="news-dashboard-title" style={{marginBottom: '1.5rem'}}>Match Odds</h2>
          <div className="matches-grid">
            {matches.map((match, index) => (
              <div
                key={`${match.matchId}-${index}`}
                className="match-card"
              >
                <div className="match-teams">
                  <div className="team">
                    <img src={match.homeLogo} alt={match.homeTeam} className="team-logo" />
                    <span className="team-name">{match.homeTeam}</span>
                  </div>
                  <span className="vs">vs</span>
                  <div className="team">
                    <span className="team-name">{match.awayTeam}</span>
                    <img src={match.awayLogo} alt={match.awayTeam} className="team-logo" />
                  </div>
                </div>
                <div className="scores">
                  <div>
                    <p>Predicted</p>
                    <p>{match.predHomeScore} - {match.predAwayScore}</p>
                  </div>
                  <div>
                    <p>Actual</p>
                    <p>{match.homeScore ?? "-"} - {match.awayScore ?? "-"}</p>
                  </div>
                </div>
                <div className="match-details">
                  <p><strong>Status:</strong> {match.matchStatus}</p>
                  <p><strong>League Round:</strong> {match.leagueRound}</p>
                  <p><strong>Venue:</strong> {match.venue}</p>
                  <p><strong>Date:</strong> {new Date(match.datetime).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MatchOdds;
