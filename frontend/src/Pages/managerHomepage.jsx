import React, { useState } from "react"; 
// import "../Styles/ManagerHomepage.css";

function ManagerHomepage() {
  const [showTeamPopup, setShowTeamPopup] = useState(false);
  const [showPlayersPopup, setShowPlayersPopup] = useState(false);

  const [formData, setFormData] = useState({
    teamName: "",
    shortName: "",
    sportType: "",
    city: "",
  });

  const [players, setPlayers] = useState(Array(10).fill("")); // 10 empty player inputs

  // Handle team form input
  const handleTeamChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle player input change
  const handlePlayerChange = (index, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = value;
    setPlayers(updatedPlayers);
  };

  // Submit team form
  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://prime-backend.azurewebsites.net/api/manager/createTeam`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Team created:", data);
        alert("Team created successfully!");
        setShowTeamPopup(false);
        setFormData({ teamName: "", shortName: "", sportType: "", city: "" });
      } else {
        const err = await response.json();
        alert("Failed to create Team: " + err.error);
      }
    } catch (error) {
      console.error("Error creating Team:", error);
      alert("Something went wrong!");
    }
  };

  // Submit players form
  const handlePlayersSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Players list:", players);

      // TODO: send to backend (e.g. /api/manager/addPlayers)
      // await fetch(...)

      alert("Players added successfully!");
      setShowPlayersPopup(false);
      setPlayers(Array(10).fill(""));
    } catch (error) {
      console.error("Error adding players:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <main className="manager-container">
      {/* Create Team Button */}
      <div className="create-team-container">
        <button className="create-team-btn" onClick={() => setShowTeamPopup(true)}>
          Create Team
        </button>
      </div>

      {/* Add Players Button */}
      <div className="add-players-container">
        <button className="add-players-btn" onClick={() => setShowPlayersPopup(true)}>
          Add Players
        </button>
      </div>

      {/* Team Popup */}
      {showTeamPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Create New Team</h3>
            <form onSubmit={handleTeamSubmit} className="team-form">
              <label>
                Team Name:
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleTeamChange}
                  required
                />
              </label>
              <label>
                Short Name:
                <input
                  type="text"
                  name="shortName"
                  value={formData.shortName}
                  onChange={handleTeamChange}
                  required
                />
              </label>
              <label>
                Sport Type:
                <select
                  name="sportType"
                  value={formData.sportType}
                  onChange={handleTeamChange}
                  required
                >
                  <option value="">-- Select Sport --</option>
                  <option value="Football">Football</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Rugby">Rugby</option>
                  <option value="Hockey">Hockey</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Volleyball">Volleyball</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>
                City:
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleTeamChange}
                  required
                />
              </label>

              <div className="form-actions">
                <button type="submit">Create</button>
                <button type="button" onClick={() => setShowTeamPopup(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Players Popup */}
      {showPlayersPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Add Players</h3>
            <form onSubmit={handlePlayersSubmit} className="players-form">
              {players.map((player, index) => (
                <label key={index}>
                  Player {index + 1}:
                  <input
                    type="text"
                    value={player}
                    onChange={(e) => handlePlayerChange(index, e.target.value)}
                    required
                  />
                </label>
              ))}

              <div className="form-actions">
                <button type="submit">Save Players</button>
                <button type="button" onClick={() => setShowPlayersPopup(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default ManagerHomepage;
