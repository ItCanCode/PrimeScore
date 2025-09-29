import React from "react";
import { Trophy } from  "lucide-react";

const MatchForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  cancelEdit,
  editingMatch,
  sportTypes,
  teams
}) => {
  
  return (
    <div className="mai-match-form">
      <h3>
        <Trophy size={22} /> {editingMatch ? 'Edit Match' : 'Create New Match'}
      </h3>
      <div className="mai-form-grid">
        <div className="mai-form-group">
          <label>Sport Type</label>
          <select name="sportType" value={formData.sportType} onChange={handleInputChange}>
            <option value="">Select a sport</option>
            {sportTypes.map((sport) => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>

        <div className="mai-form-group">
          <label>Match Name</label>
          <input
            type="text"
            name="matchName"
            placeholder="e.g., Champions League"
            value={formData.matchName}
            onChange={handleInputChange}
          />
        </div>

        <div className="mai-form-group">
          <label>Home Team</label>
          <select name="homeTeam" value={formData.homeTeam} onChange={handleInputChange}>
            <option value="">Select Home Team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.name}>{team.name}</option>
            ))}
          </select>
        </div>

        <div className="mai-form-group">
          <label>Away Team</label>
          <select name="awayTeam" value={formData.awayTeam} onChange={handleInputChange}>
            <option value="">Select Away Team</option>
            {teams.filter((team) => team.name !== formData.homeTeam).map((team) => (
              <option key={team.id} value={team.name}>{team.name}</option>
            ))}
          </select>
        </div>

        <div className="mai-form-group">
          <label>Start Time</label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
          />
        </div>

        <div className="mai-form-group">
          <label>Venue</label>
          <input
            type="text"
            name="venue"
            placeholder="Enter venue name"
            value={formData.venue}
            onChange={handleInputChange}
          />
        </div>

        <div className="mai-form-actions">
          <button className="mai-create-btn" onClick={handleSubmit}>
            {editingMatch ? 'Save Changes' : 'Create Match'}
          </button>
          <button className="mai-cancel-btn" onClick={cancelEdit}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default MatchForm;
