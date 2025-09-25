import React, { useState, useEffect } from 'react';
import { Plus, X, Users, MapPin, Trophy, Target } from 'lucide-react';
import '../Styles/TeamManagement.css';
import { useAuth } from "../context/useAuth.js";

const TeamManagement = () => {
  const { token } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState({ name: '', position: '', number: '', age: '' });
  const [newTeam, setNewTeam] = useState({ teamName: '', shortName: '', sportType: '', city: '' });

  const sportOptions = ['Football','Netball','Rugby'];

  useEffect(() => {
    const fetchMyTeam = async () => {
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`https://prime-backend.azurewebsites.net/api/manager/myTeam`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.hasTeam) {
            setTeam(data.team);
          }
        } else {
          console.error("Failed to fetch team");
        }
      } catch (error) {
        console.error("Error fetching team:", error);
      }
      setLoading(false);
    };

    fetchMyTeam();
  }, [token]);


  const getPositionsBySport = (sport) => {
    const positions = {
      'Football': ['Goalkeeper','Defender','Midfielder','Forward'],
      'Netball': ['Point Guard','Shooting Guard','Small Forward','Power Forward','Center'],
      'Rugby': ['Forward','Back','Scrum Half','Fly Half','Hooker','Prop'],
    };
    return positions[sport] || [];
  };

  const handleCreateTeam = async () => {
    if (!newTeam.teamName || !newTeam.shortName || !newTeam.city || !newTeam.sportType) {
      alert("Please fill in all fields");
      return;
    }

    if (!token) return;

    try {
      const response = await fetch(`https://prime-backend.azurewebsites.net/api/manager/createTeam`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization:`Bearer ${token}`,
         },
        body: JSON.stringify(newTeam),
      });

      if (response.ok) {
        const data = await response.json();
        setTeam({ ...newTeam, teamId: data.teamId }); // only set team after successful creation
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

  const handleAddPlayer = async (e) => {
    e.preventDefault();

    if (!token) return;

    try {
      const res = await fetch(`https://prime-backend.azurewebsites.net/api/manager/addPlayers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teamId: team.teamId,
          players: [newPlayer],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlayers([...players, ...data.players]); // update list
        setNewPlayer({ name: '', position: '', number: '', age: '' });
        setShowAddPlayerModal(false);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add player");
      }
    } catch (err) {
      console.error("Error adding player:", err);
    }
  };

  useEffect(() => {
  if (!team) return;

  const fetchPlayers = async () => {
    try {
      const res = await fetch(`https://prime-backend.azurewebsites.net/api/manager/players/${team.teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players || []);
      }
    } catch (err) {
      console.error("Error fetching players:", err);
    }
  };

  fetchPlayers();
}, [team,token]);


  const removePlayer = async (id) => {

    try {
      const res = await fetch(`https://prime-backend.azurewebsites.net/api/manager/player/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPlayers(players.filter(p => p.playerId !== id));
      }
    } catch (err) {
      console.error("Error removing player:", err);
    }
  };

  if (loading) {
    return <div className="tm-container"><p>Loading team...</p></div>;
  }

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
              <div key={player.playerId} className="tm-player-card">
                <button onClick={()=>removePlayer(player.playerId)} className="tm-remove-player-button"><X/></button>
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
