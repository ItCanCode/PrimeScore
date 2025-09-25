import React from "react";
import { Calendar, MapPin, Users, Play, Plus, Clock, Square, Edit2, Trash2 } from  "lucide-react";


const MatchesList = ({
  filteredMatches,
  activeTab,
  matchStats,
  matchEvents,
  formatDateTime,
  getStatusColor,
  getStatusIcon,
  editMatch,
  deleteMatch,
  startMatch,
  openEventForm,
  updateMatchStatus
}) => {
  return (
    <div className="mai-matches-list">
      <div className="mai-matches-header">
        <h3>
          <Calendar size={22} /> {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Matches
        </h3>
      </div>
      <div className="mai-matches-body">
        {filteredMatches.length === 0 ? (
          <div className="mai-no-matches">
            <Calendar size={80} />
            <p>No {activeTab} matches found</p>
          </div>
        ) : (
          filteredMatches.map((match, idx) => (
            <div key={match.id || idx} className="mai-match-card">
              <div className="mai-match-header">
                <div className="mai-match-badges">
                  <span className="mai-sport-tag">{match.sportType}</span>
                  <div 
                    className="mai-status-badge"
                    style={{ backgroundColor: getStatusColor(match.status || 'scheduled') }}
                  >
                    {getStatusIcon(match.status || 'scheduled')}
                    <span className="capitalize">{match.status || 'scheduled'}</span>
                  </div>
                </div>
                <div className="mai-match-actions">
                  <button
                    onClick={() => editMatch(match)}
                    className="mai-action-btn mai-edit-btn"
                    title="Edit Match"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteMatch(match.id)}
                    className="mai-action-btn mai-delete-btn"
                    title="Delete Match"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mai-match-info">
                <h4>{match.matchName}</h4>
                <div className="mai-teams">
                  <Users size={18} /> 
                  <span>{match.homeTeam}</span>
                  {(match.status === 'ongoing' || match.status === 'finished') ? (
                    <span className="mai-score">
                      {(matchStats[match.id]?.homeScore ?? 0)} - {(matchStats[match.id]?.awayScore ?? 0)}
                    </span>
                  ) : (
                    <span>vs</span>
                  )}
                  <span>{match.awayTeam}</span>
                </div>
                <div className="mai-match-meta">
                  <div>
                    <Calendar size={16} /> {formatDateTime(match.startTime)}
                  </div>
                  <div>
                    <MapPin size={16} /> {match.venue}
                  </div>
                </div>

                <div className="mai-events-list">
                  <h5>Match Events:</h5>
                  {matchEvents[match.id] && matchEvents[match.id].length > 0 ? (
                    matchEvents[match.id].map((event, eidx) => {
                      let eventLabel = event.eventType || event.type || event._guessedType;
                      if (!eventLabel && event.card === 'yellow') eventLabel = 'Foul (Yellow Card)';
                      else if (!eventLabel && event.card === 'red') eventLabel = 'Foul (Red Card)';
                      else if (!eventLabel && event.card) eventLabel = `Foul (${event.card.charAt(0).toUpperCase() + event.card.slice(1)} Card)`;
                      else if (!eventLabel) eventLabel = 'Unknown Event';
                      if ((eventLabel === 'Foul' || eventLabel === 'foul') && event.card) {
                        eventLabel = `Foul (${event.card.charAt(0).toUpperCase() + event.card.slice(1)} Card)`;
                      }
                      return (
                        <div key={event.id || eidx} className="mai-event-item">
                          <span className="mai-event-time">{event.time ? `${event.time}'` : ''}</span>
                          <span className="mai-event-type">{eventLabel}</span>
                          {event.player && <span className="mai-event-player">{event.player}</span>}
                          {event.team && <span className="mai-event-team">({event.team})</span>}
                        </div>
                      );
                    })
                  ) : (
                    <div className="mai-event-item mai-event-empty">No events yet.</div>
                  )}
                </div>

                <div className="mai-status-controls">
                  {match.status === 'scheduled' && (
                    <button
                      onClick={() => startMatch(match)}
                      className="mai-status-btn mai-start-btn"
                    >
                      <Play size={16} />
                      Start Match
                    </button>
                  )}
                  {match.status === 'ongoing' && (
                    <>
                      <button
                        onClick={() => openEventForm(match)}
                        className="mai-status-btn mai-event-btn"
                      >
                        <Plus size={16} />
                        Add Event
                      </button>
                      <button
                        onClick={() => updateMatchStatus(match.id, 'scheduled')}
                        className="mai-status-btn mai-upcoming-btn"
                      >
                        <Clock size={16} />
                        Back to Scheduled
                      </button>
                      <button
                        onClick={() => updateMatchStatus(match.id, 'finished')}
                        className="mai-status-btn mai-finish-btn"
                      >
                        <Square size={16} />
                        End Match
                      </button>
                    </>
                  )}
                  {match.status === 'finished' && (
                    <button
                      onClick={() => updateMatchStatus(match.id, 'ongoing')}
                      className="mai-status-btn mai-resume-btn"
                    >
                      <Play size={16} />
                      Resume Match
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MatchesList;
