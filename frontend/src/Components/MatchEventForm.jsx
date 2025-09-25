import React from "react";
import { X } from "lucide-react";

const MatchEventForm = ({
  selectedMatch,
  eventData,
  eventTypes,
  handleEventInputChange,
  closeEventForm,
  addMatchEvent,
  players
}) => {
  if (!selectedMatch) return null;

  return (
    <div className="mai-modal-overlay">
      <div className="mai-event-modal">
        <div className="mai-event-modal-header">
          <h3>Add Match Event</h3>
          <p>{selectedMatch.homeTeam} vs {selectedMatch.awayTeam}</p>
          <button onClick={closeEventForm} className="mai-modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="mai-event-form">
          <div className="mai-form-group">
            <label>Event Type</label>
            <select name="eventType" value={eventData.eventType} onChange={handleEventInputChange}>
              <option value="">Select event type</option>
              {eventTypes.map((event) => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>
          </div>

          <div className="mai-form-group">
            <label>Team</label>
            <select name="team" value={eventData.team} onChange={handleEventInputChange}>
              <option value="">Select team</option>
              <option value="Home">Home ({selectedMatch.homeTeam})</option>
              <option value="Away">Away ({selectedMatch.awayTeam})</option>
            </select>
          </div>

          {eventData.eventType !== "Substitution" && (
            <div className="mai-form-group">
              <label>Player Responsible</label>
              <select
                    name="player"
                    value={eventData.player}
                    onChange={handleEventInputChange}
                  >
                    <option value="">Select player</option>
                    {eventData.team === "Home" &&
                      players[selectedMatch.homeTeam]?.map((p) => (
                        <option key={p.playerId} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    {eventData.team === "Away" &&
                      players[selectedMatch.awayTeam]?.map((p) => (
                        <option key={p.playerId} value={p.name}>
                          {p.name}
                        </option>
                      ))}
              </select>
            </div>
          )}

          {eventData.eventType === "Substitution" && (
            <>
              <div className="mai-form-group">
                <label>Player In</label>
                <select
                      name="playerIn"
                      value={eventData.playerIn}
                      onChange={handleEventInputChange}
                    >
                      <option value="">Select player</option>
                      {eventData.team === "Home" &&
                        players[selectedMatch.homeTeam]?.map((p) => (
                          <option key={p.playerId} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      {eventData.team === "Away" &&
                        players[selectedMatch.awayTeam]?.map((p) => (
                          <option key={p.playerId} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                </select>
              </div>
              <div className="mai-form-group">
                <label>Player Out</label>
                <select
                      name="playerOut"
                      value={eventData.playerOut}
                      onChange={handleEventInputChange}
                    >
                      <option value="">Select player</option>
                      {eventData.team === "Home" &&
                        players[selectedMatch.homeTeam]?.map((p) => (
                          <option key={p.playerId} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      {eventData.team === "Away" &&
                        players[selectedMatch.awayTeam]?.map((p) => (
                          <option key={p.playerId} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                </select>
              </div>
            </>
          )}

          <div className="mai-form-group">
            <label>Time (Minutes)</label>
            <input 
              type="number" 
              name="time" 
              min="0"
              max="120" 
              step="1"
              placeholder="e.g., 45, 90+2" 
              value={eventData.time} 
              onChange={handleEventInputChange} 
            />
          </div>

          <div className="mai-event-form-actions">
            <button className="mai-cancel-btn" onClick={closeEventForm}>
              Cancel
            </button>
            <button className="mai-create-btn" onClick={addMatchEvent}>
              Add Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchEventForm;
