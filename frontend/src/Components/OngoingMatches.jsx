import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, Trophy } from 'lucide-react';
import Loading from './Loading';
import MatchClock from './MatchClock.jsx';
import MatchEventAnimation from './MatchEventAnimation.jsx';
import '../Styles/OngoingMatches.css';

const OngoingMatches = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ sportType passed when navigating
  const sportType = location.state?.sport || null;

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [highlightedMatchId, setHighlightedMatchId] = useState(null);
  const animationUtilsRef = useRef(null);

  const getMatchStats = (events = []) => {
    let homeScore = 0, awayScore = 0;
    let fouls = [], substitutions = [];
    if (Array.isArray(events)) {
      events.forEach(event => {
        if (event.type === 'score') {
          if (typeof event.home === 'number') homeScore = event.home;
          if (typeof event.away === 'number') awayScore = event.away;
        }
        if (event.type === 'foul') fouls.push(event);
        if (event.type === 'substitution') substitutions.push(event);
      });
    } else if (events && typeof events === 'object') {
      if (typeof events.homeScore === 'number') homeScore = events.homeScore;
      if (typeof events.awayScore === 'number') awayScore = events.awayScore;
      if (Array.isArray(events.fouls)) fouls = events.fouls;
      if (Array.isArray(events.substitutions)) substitutions = events.substitutions;
    }
    return { homeScore, awayScore, fouls, substitutions };
  };

  const fetchOngoingMatches = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsUpdating(true);
      }
      setError(null);
      const response = await fetch('https://prime-backend.azurewebsites.net/api/display/display-matches');
      if (!response.ok) throw new Error('Failed to fetch matches');
      const data = await response.json();

      // ✅ Filter only ongoing + by sportType if provided
      const ongoing = Array.isArray(data)
        ? data.filter(m => {
            const status = (m.status || "").toLowerCase();
            const hasEndTime = m.end_time || m.endTime;
            
            // A match is ongoing if:
            // 1. Status is explicitly "ongoing"
            // 2. AND it doesn't have an end_time (which would indicate completion)
            // 3. AND it's not marked as "finished"
            const statusOk = status === 'ongoing' && status !== 'finished' && !hasEndTime;
            const sportOk = !sportType || (m.sportType?.toLowerCase() === sportType.toLowerCase());
            return statusOk && sportOk;
          })
        : [];

      setMatches(prevMatches => {
        const hasChanged = JSON.stringify(prevMatches) !== JSON.stringify(ongoing);
        if (hasChanged) {
          setLastUpdated(new Date());
        }
        return ongoing;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setIsUpdating(false);
      }
    }
  };

  // Poll for updates every 10 seconds for near real-time updates
  useEffect(() => {
    fetchOngoingMatches(true);
    const interval = setInterval(() => fetchOngoingMatches(false), 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [sportType]); // ✅ re-fetch when sportType changes



  const getSportIcon = (sport) => {
    switch (sport) {
      case 'Football': return '⚽';
      case 'Basketball': return '🏀';
      case 'Cricket': return '🏏';
      default: return '🏆';
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return { dateStr, timeStr };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return 'status-scheduled';
      case 'Confirmed': return 'status-confirmed';
      case 'Postponed': return 'status-postponed';
      case 'Ongoing': return 'status-ongoing';
      default: return 'status-default';
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="ongoing-matches-error">Error: {error}</div>;
  if (!matches.length) {
    return (
      <div className="ongoing-matches-empty">
        No ongoing {sportType ? sportType.toLowerCase() : ''} matches at the moment.
      </div>
    );
  }

  return (
    <div className="ongoing-matches-container">
      {/* Animation Component */}
      <MatchEventAnimation
        matches={matches}
        onAnimationTrigger={(matchId, eventType) => {
          console.log(`🎬 Animation started: ${matchId} - ${eventType}`);
          setHighlightedMatchId(matchId);
        }}
        onAnimationEnd={(matchId, eventType) => {
          console.log(`🎬 Animation ended: ${matchId} - ${eventType}`);
          setHighlightedMatchId(null);
        }}
      >
        {({ isMatchAnimating, getAnimationData, endAnimation }) => {
          // Store animation utilities in ref for use in render
          animationUtilsRef.current = { isMatchAnimating, getAnimationData, endAnimation };
          return null;
        }}
      </MatchEventAnimation>

      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', color: '#0e0d0dff', cursor: 'pointer' }}>Back</button>

      <div className="ongoing-header-card">
        <div className="ongoing-header-content">
          <h1 className="ongoing-header-title">
            <Trophy className="ongoing-header-icon" size={36} />
            Ongoing {sportType ? `${sportType} ` : ''}Matches
            {isUpdating && (
              <span style={{ marginLeft: '10px', fontSize: '14px', color: '#163453ff', opacity: 0.8 }}>
                .
              </span>
            )}
          </h1>
          <p className="ongoing-header-subtitle">
            Live scores, fouls, and substitutions for matches in progress
          </p>
        </div>
      </div>

      <div className="ongoing-matches-grid">
        {matches.map((match) => {
          let homeScore = typeof match.homeScore === 'number' ? match.homeScore : undefined;
          let awayScore = typeof match.awayScore === 'number' ? match.awayScore : undefined;
          let fouls = [], substitutions = [];
          if (homeScore === undefined || awayScore === undefined) {
            const stats = getMatchStats(match.events);
            if (homeScore === undefined) homeScore = stats.homeScore;
            if (awayScore === undefined) awayScore = stats.awayScore;
            fouls = stats.fouls;
            substitutions = stats.substitutions;
          } else {
            const stats = getMatchStats(match.events);
            fouls = stats.fouls;
            substitutions = stats.substitutions;
          }
          const { dateStr, timeStr } = formatDateTime(match.startTime);
          return (
            <div
              key={match.id}
              className={`ongoing-match-card ${highlightedMatchId === match.id ? "score-anim" : ""}`}
              onAnimationEnd={() => {
                // Use animation utilities if available
                if (animationUtilsRef.current && animationUtilsRef.current.endAnimation) {
                  animationUtilsRef.current.endAnimation(match.id);
                }
                setHighlightedMatchId(null);
              }}
            >
              <div className="ongoing-sport-header">
                <div className="ongoing-sport-header-content">
                  <div className="ongoing-sport-type">
                    <span className="ongoing-sport-icon">{getSportIcon(match.sportType)}</span>
                    <span className="ongoing-sport-name">{match.sportType}</span>
                  </div>
                  <span className="ongoing-status-label-header">{match.status}</span>
                </div>
              </div>

              <div className="ongoing-match-content">
                <div className="ongoing-teams">
                  <div className="ongoing-team-name">{match.homeTeam}</div>
                  <div className="ongoing-vs">VS</div>
                  <div className="ongoing-team-name">{match.awayTeam}</div>
                </div>
                <div className={`ongoing-score-row ${animationUtilsRef.current?.isMatchAnimating(match.id) ? "goal-animate" : ""}`}>
                  <span className="ongoing-score">{homeScore} - {awayScore}</span>
                  {animationUtilsRef.current?.isMatchAnimating(match.id) && (
                    <span style={{ fontSize: '12px', color: '#ffd700', marginLeft: '10px' }}>
                       GOAL!
                    </span>
                  )}
                </div>

                {/* Match Clock Display - show for ongoing matches */}
                <div className="ongoing-match-clock">
                  <MatchClock matchId={match.id} status={match.status} showControls={false} />
                </div>

                <div className="ongoing-match-details">
                  <div className="ongoing-detail-item ongoing-venue">
                    <MapPin size={18} className="ongoing-icon-gray" />
                    <span>{match.venue}</span>
                  </div>
                  <div className="ongoing-date-time-container">
                    <div className="ongoing-detail-item ongoing-date">
                      <Calendar size={18} className="ongoing-icon-gray" />
                      <span>{dateStr}</span>
                    </div>
                    <div className="ongoing-detail-item ongoing-time">
                      <Clock size={18} className="ongoing-icon-gray" />
                      <span>{timeStr}</span>
                    </div>
                  </div>
                </div>

                <div className="ongoing-status-badge-container">
                  <span className={`ongoing-status-badge ${getStatusColor(match.status)}`}>
                    {match.status}
                  </span>
                </div>

                <div className="ongoing-extra-stats">
                  <div className="ongoing-match-fouls">
                    <strong>Fouls:</strong>
                    {fouls.length ? (
                      <ul>
                        {fouls.map((foul, idx) => (
                          <li key={idx}>{foul.player} ({foul.team}) - {foul.description || 'Foul'}</li>
                        ))}
                      </ul>
                    ) : <span> None</span>}
                  </div>
                  <div className="ongoing-match-subs">
                    <strong>Substitutions:</strong>
                    {substitutions.length ? (
                      <ul>
                        {substitutions.map((sub, idx) => (
                          <li key={idx}>{sub.playerOut} → {sub.playerIn} ({sub.team})</li>
                        ))}
                      </ul>
                    ) : <span> None</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="ongoing-footer">
        Last updated: {lastUpdated.toLocaleString()}
        {isUpdating && (
          <span style={{ marginLeft: '10px', color: '#007bff', fontSize: '12px' }}>
            • Refreshing data...
          </span>
        )}
      </div>
    </div>
  );
};

export default OngoingMatches;
