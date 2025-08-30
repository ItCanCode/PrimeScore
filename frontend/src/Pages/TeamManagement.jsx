import React, { useState } from 'react';
import { Plus, X, Users, MapPin, Trophy, Target } from 'lucide-react';
import '../Styles/TeamManagement.css';

const TeamManagement = () => {
  const [team, setTeam] = useState(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState({ name: '', position: '', number: '', age: '' });
  const [newTeam, setNewTeam] = useState({ teamName: '', shortName: '', sportType: '', city: '' });

  const sportOptions = ['Soccer','Basketball','Rugby'];

  const getPositionsBySport = (sport) => {
    const positions = {
      'Soccer': ['Goalkeeper','Defender','Midfielder','Forward'],
      'Basketball': ['Point Guard','Shooting Guard','Small Forward','Power Forward','Center'],
      'Rugby': ['Forward','Back','Scrum Half','Fly Half','Hooker','Prop'],
    };
    return positions[sport] || [];
  };

  const handleCreateTeam = async () => {
    if (!newTeam.teamName || !newTeam.shortName || !newTeam.city || !newTeam.sportType) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch(`https://prime-backend.azurewebsites.net/api/manager/createTeam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeam),
      });

      if (response.ok) {
        const data = await response.json();
        setTeam(newTeam); // only set team after successful creation
        setNewTeam({ teamName: '', shortName: '', sportType: '', city: '' });
        alert("Team created successfully!");
        console.log("Team created:", data);
      } else {
        const err = await response.json();
        alert("Failed to create Team: " + err.error);
      }
    } catch (error) {
      console.error("Error creating Team:", error);
      alert("Something went wrong!");
    }
  };

  const handleAddPlayer = () => {
    if (!newPlayer.name || !newPlayer.position || !newPlayer.number) {
      alert("Please fill in player name, position, and number");
      return;
    }
    setPlayers([...players, { ...newPlayer, id: Date.now() }]);
    setNewPlayer({ name:'', position:'', number:'', age:'' });
    setShowAddPlayerModal(false);
  };

  const removePlayer = (id) => setPlayers(players.filter(player => player.id !== id));

//   const resetTeam = () => {
//     setTeam(null);
//     setPlayers([]);
//     setNewPlayer({ name:'', position:'', number:'', age:'' });
//     setNewTeam({ teamName: '', shortName: '', sportType: '', city: '' });
//   };

  // TEAM CREATION VIEW
  if (!team) {
    return (
      <div className="tm-bg">
        <div className="tm-floating-elements">
          <div className="tm-float-orange"></div>
          <div className="tm-float-blue"></div>
          <div className="tm-float-green"></div>
          <div className="tm-float-purple"></div>
          <div className="tm-float-red"></div>
          <div className="tm-float-yellow"></div>
        </div>

        <div className="tm-container">
          <div className="tm-text-center">
            <h1 className="tm-page-title">Team Management</h1>
            <p className="tm-page-subtitle">
              Create and manage your sports teams. Start by creating a new team to get started with the PrimeScore system.
            </p>
          </div>

          <div className="tm-form">
            <div className="tm-icon-wrapper">
              <div className="tm-target-icon"><Target className="tm-target-svg"/></div>
            </div>

            <h2 className="tm-form-title">Create New Team</h2>

            <div className="tm-form-fields">
              <div className="tm-form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  value={newTeam.teamName}
                  onChange={e => setNewTeam({ ...newTeam, teamName: e.target.value })}
                  placeholder="Enter your team name"
                />
              </div>

              <div className="tm-form-group">
                <label>Short Name / Abbreviation</label>
                <input
                  type="text"
                  value={newTeam.shortName}
                  onChange={e => setNewTeam({ ...newTeam, shortName: e.target.value.toUpperCase() })}
                  placeholder="e.g., MUN, LAL, NYY"
                  maxLength="5"
                />
              </div>

              <div className="tm-form-group">
                <label>Home City</label>
                <input
                  type="text"
                  value={newTeam.city}
                  onChange={e => setNewTeam({ ...newTeam, city: e.target.value })}
                  placeholder="Enter your team's home city"
                />
              </div>

              <div className="tm-form-group">
                <label>Sport Type</label>
                <select
                  value={newTeam.sportType}
                  onChange={e => setNewTeam({ ...newTeam, sportType: e.target.value })}
                >
                  <option value="">Select sport type</option>
                  {sportOptions.map(sport => <option key={sport} value={sport}>{sport}</option>)}
                </select>
              </div>
            </div>

            <div className="tm-create-button-wrapper">
              <button
                onClick={handleCreateTeam}
                disabled={!newTeam.teamName || !newTeam.shortName || !newTeam.city || !newTeam.sportType}
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TEAM MANAGEMENT VIEW
  return (
    <div className="tm-bg">
      <div className="tm-floating-elements">
        <div className="tm-float-orange"></div>
        <div className="tm-float-blue"></div>
        <div className="tm-float-green"></div>
        <div className="tm-float-purple"></div>
        <div className="tm-float-red"></div>
        <div className="tm-float-yellow"></div>
      </div>

      <div className="tm-container">
        <div className="tm-text-center">
          <h1 className="tm-page-title-small">Team Management</h1>
        
        </div>

        <div className="tm-team-summary">
          <div className="tm-team-summary-card">
            <div className="tm-team-summary-info">
              <h2>{team.teamName}</h2>
              <p>({team.shortName})</p>
            </div>
            <div className="tm-team-summary-stats">
              <div className="tm-stat-card"><Trophy/><p>{team.sportType}</p></div>
              <div className="tm-stat-card"><MapPin/><p>{team.city}</p></div>
              <div className="tm-stat-card"><Users/><p>{players.length}</p></div>
            </div>
            <button onClick={()=>setShowAddPlayerModal(true)} className="tm-add-player-button">
              <Plus/>Add Player
            </button>
          </div>
        </div>

        {players.length > 0 && (
          <div className="tm-players-grid">
            {players.map(player => (
              <div key={player.id} className="tm-player-card">
                <button onClick={()=>removePlayer(player.id)} className="tm-remove-player-button"><X/></button>
                <div className="tm-player-info">
                  <div className="tm-player-number">{player.number}</div>
                  <h4>{player.name}</h4>
                  <p>{player.position}</p>
                  {player.age && <p>Age: {player.age}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddPlayerModal && (
          <div className="tm-modal-overlay">
            <div className="tm-modal-content">
              <div className="tm-modal-header">
                <h3>Add New Player</h3>
                <button onClick={()=>setShowAddPlayerModal(false)} className="tm-modal-close"><X/></button>
              </div>

              <div className="tm-modal-body">
                <div className="tm-modal-field">
                  <label>Player Name</label>
                  <input type="text" value={newPlayer.name} onChange={e=>setNewPlayer({...newPlayer,name:e.target.value})} placeholder="Enter player name"/>
                </div>

                <div className="tm-modal-field">
                  <label>Position</label>
                  <select value={newPlayer.position} onChange={e=>setNewPlayer({...newPlayer,position:e.target.value})}>
                    <option value="">Select position</option>
                    {getPositionsBySport(team.sportType).map(pos => <option key={pos} value={pos}>{pos}</option>)}
                  </select>
                </div>

                <div className="tm-modal-field">
                  <label>Jersey Number</label>
                  <input type="number" value={newPlayer.number} onChange={e=>setNewPlayer({...newPlayer,number:e.target.value})} min="1" max="99"/>
                </div>

                <div className="tm-modal-field">
                  <label>Age (Optional)</label>
                  <input type="number" value={newPlayer.age} onChange={e=>setNewPlayer({...newPlayer,age:e.target.value})} min="16" max="50"/>
                </div>
              </div>

              <div className="tm-modal-footer">
                <button onClick={()=>setShowAddPlayerModal(false)}>Cancel</button>
                <button onClick={handleAddPlayer}>Add Player</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;
