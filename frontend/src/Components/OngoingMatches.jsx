import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Trophy, AlertTriangle, Flag, CornerDownRight, User, Award, Circle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Styles/upcomingMatches.css';
import { db } from '../firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

// OngoingMatches component displays all ongoing matches and their live stats (score, fouls, cards, etc.)
// Stats are updated in real time using Firestore listeners on match_events
const OngoingMatches = () => {
  const navigate = useNavigate();
  // List of ongoing matches
  const [matches, setMatches] = useState([]);
  // Stats for each match, keyed by matchId
  const [matchStats, setMatchStats] = useState({});

  // Real-time updates for ongoing matches and their events
  // useEffect: Fetch ongoing matches and set up real-time listeners for their events
  // Any change in match_events will instantly update the UI
  useEffect(() => {
    let unsubscribes = [];
    const fetchOngoingMatches = async () => {
      try {
        // Get all ongoing matches from Firestore
        const querySnapshot = await getDocs(collection(db, 'ongoingMatches'));
        const ongoing = [];
        querySnapshot.forEach((doc) => {
          ongoing.push({ id: doc.id, ...doc.data() });
        });
        setMatches(ongoing);
        // Remove old listeners
        unsubscribes.forEach(unsub => unsub && unsub());
        unsubscribes = [];
        // For each ongoing match, listen to its match_events subcollection
        ongoing.forEach((match) => {
          const eventsCol = collection(db, 'match_events', String(match.id), 'events');
          // Firestore onSnapshot gives real-time updates for this match's events
          const unsub = onSnapshot(eventsCol, (snapshot) => {
            const events = snapshot.docs.map(doc => doc.data());
            // Calculate stats from events
            let homeScore = 0;
            let awayScore = 0;
            let fouls = { Home: 0, Away: 0 };
            let yellowCards = { Home: 0, Away: 0 };
            let redCards = { Home: 0, Away: 0 };
            let penalties = { Home: 0, Away: 0 };
            let corners = { Home: 0, Away: 0 };
            let freeKicks = { Home: 0, Away: 0 };
            let goals = [];
            events.forEach(event => {
              if (event.eventType === 'Goal') {
                if (event.team === 'Home') homeScore++;
                if (event.team === 'Away') awayScore++;
                goals.push(event);
              }
              if (event.eventType === 'Foul') fouls[event.team]++;
              if (event.eventType === 'Yellow Card') yellowCards[event.team]++;
              if (event.eventType === 'Red Card') redCards[event.team]++;
              if (event.eventType === 'Penalty') penalties[event.team]++;
              if (event.eventType === 'Corner Kick') corners[event.team]++;
              if (event.eventType === 'Free Kick') freeKicks[event.team]++;
            });
            // Update stats for this match in state
            setMatchStats(prev => ({
              ...prev,
              [match.id]: {
                homeScore,
                awayScore,
                fouls,
                yellowCards,
                redCards,
                penalties,
                corners,
                freeKicks,
                goals,
                events
              }
            }));
          });
          unsubscribes.push(unsub);
        });
      } catch {
        setMatches([]);
      }
    };
    fetchOngoingMatches();
    // Cleanup: remove all Firestore listeners on unmount
    return () => {
      unsubscribes.forEach(unsub => unsub && unsub());
    };
  }, []);

  const getStatusColor = (status) => {
    if (status === 'ongoing') return 'status-confirmed';
    return 'status-default';
  };

  const getSportIcon = (sport) => {
    switch (sport) {
      case 'Football':
        return '⚽';
      case 'Basketball':
        return '🏀';
      case 'Cricket':
        return '🏏';
      default:
        return '🏆';
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

  return (
    <div className="upcoming-matches-container">
      <div className="header-card">
        <div className="header-content">
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center' }}
            aria-label="Go back"
          >
            <ArrowLeft size={24} style={{ marginRight: 4 }} /> Back
          </button>
          <h1 className="header-title">
            <Trophy className="header-icon" size={36} />
            Ongoing Matches
          </h1>
          <p className="header-subtitle">
            View all matches currently in progress
          </p>
        </div>
      </div>
      <div className="matches-grid">
        {matches.length === 0 ? (
          <div className="no-matches">No ongoing matches found.</div>
        ) : (
          matches.map((match) => {
            const { dateStr, timeStr } = formatDateTime(match.startTime);
            const stats = matchStats[match.id] || {};
            return (
              <div key={match.id} className="match-card">
                <div className="sport-header">
                  <div className="sport-header-content">
                    <div className="sport-type">
                      <span className="sport-icon">{getSportIcon(match.sportType)}</span>
                      <span className="sport-name">{match.sportType}</span>
                    </div>
                    <span className="status-label-header">{match.status}</span>
                  </div>
                </div>
                <div className="match-content">
                  <div className="teams">
                    <div className="team-name">{match.homeTeam}</div>
                    <div className="vs">VS</div>
                    <div className="team-name">{match.awayTeam}</div>
                  </div>
                  <div className="match-details">
                    <div className="detail-item venue">
                      <MapPin size={18} className="icon-gray" />
                      <span>{match.venue}</span>
                    </div>
                    <div className="date-time-container">
                      <div className="detail-item date">
                        <Calendar size={18} className="icon-gray" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="detail-item time">
                        <Clock size={18} className="icon-gray" />
                        <span>{timeStr}</span>
                      </div>
                    </div>
                  </div>
                  <div className="status-badge-container">
                    <span className={`status-badge ${getStatusColor(match.status)}`}>
                      {match.status}
                    </span>
                  </div>
                  {/* Live Stats Section */}
                  <div className="live-stats-section" style={{marginTop: '1rem', background: '#f8fafc', borderRadius: 8, padding: 12}}>
                    <div style={{display:'flex', justifyContent:'center', alignItems:'center', fontWeight:'bold', fontSize:'1.2rem'}}>
                      <Award size={18} style={{marginRight:4}}/> Score: <span style={{marginLeft:8, color:'#22c55e'}}>{stats.homeScore ?? match.homeScore ?? 0} - {stats.awayScore ?? match.awayScore ?? 0}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-around', marginTop:8, fontSize:'0.95rem'}}>
                      <span title="Fouls"><Flag size={16}/> {stats.fouls?.Home ?? 0} / {stats.fouls?.Away ?? 0}</span>
                      <span title="Yellow Cards"><AlertTriangle color="#facc15" size={16}/> {stats.yellowCards?.Home ?? 0} / {stats.yellowCards?.Away ?? 0}</span>
                      <span title="Red Cards"><AlertTriangle color="#ef4444" size={16}/> {stats.redCards?.Home ?? 0} / {stats.redCards?.Away ?? 0}</span>
                      <span title="Penalties"><Circle color="#6366f1" size={16}/> {stats.penalties?.Home ?? 0} / {stats.penalties?.Away ?? 0}</span>
                      <span title="Corners"><CornerDownRight size={16}/> {stats.corners?.Home ?? 0} / {stats.corners?.Away ?? 0}</span>
                      <span title="Free Kicks"><User size={16}/> {stats.freeKicks?.Home ?? 0} / {stats.freeKicks?.Away ?? 0}</span>
                    </div>
                    {/* Goals Timeline */}
                    {stats.goals && stats.goals.length > 0 && (
                      <div style={{marginTop:8}}>
                        <div style={{fontWeight:'bold', marginBottom:4}}>Goals:</div>
                        <ul style={{paddingLeft:16, margin:0}}>
                          {stats.goals.map((goal, idx) => (
                            <li key={idx} style={{fontSize:'0.95rem'}}>
                              <Award size={14} style={{marginRight:2}}/>{goal.player} ({goal.team}) - {goal.time}'
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="footer">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default OngoingMatches;
