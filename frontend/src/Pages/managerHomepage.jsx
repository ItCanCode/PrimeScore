import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom"; 
import "../Styles/ManagerHomepage.css";
import UpcomingMatches from '../Components/upcomingMatches';

function ManagerHomepage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    teamName: "",
    shortName: "",
    sportType: "",
    city: "",
  });

  const navigate = useNavigate(); 

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  // Form handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://prime-backend.azurewebsites.net/api/manager/createTeam`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Team created:", data);
        alert("Team created successfully!");
        setShowPopup(false);
        setFormData({
          teamName: "",
          shortName: "",
          sportType: "",
          city: "",
        });
      } else {
        const err = await response.json();
        alert("Failed to create Team: " + err.error);
      }
    } catch (error) {
      console.error("Error creating Team:", error);
      alert("Something went wrong!");
    }
  };


  return (
    <main className="home-container">
      {/* Dropdown Menu at top right */}
      <section className="dropdown-global">
        <button
          className="menu-btn"
          onClick={() => setDropdownOpen((open) => !open)}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          Menu &#x25BC;
        </button>
        {dropdownOpen && (
          <section className="dropdown-content">
            <button className="icon-btn" title="Notifications">Notifications</button>
            <button
              className="icon-btn"
              title="Profile"
              onClick={() => navigate("/profile")}
            >
              Profile
            </button>
            <button className="icon-btn" title="Logout" onClick={handleLogout}>
              Logout
            </button>
          </section>
        )}
      </section>

      {/* Header */}
      <header className="home-header">
        <h2 className="welcome-text">Welcome Back</h2>
      </header>

      {/* Create Team Button */}
      <div className="create-team-container">
        <button className="create-team-btn" onClick={() => setShowPopup(true)}>
          Create Team
        </button>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Create New Team</h3>
            <form onSubmit={handleSubmit} className="team-form">
              <label>
                Team Name:
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Short Name:
                <input
                  type="text"
                  name="shortName"
                  value={formData.shortName}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Sport Type:
                <select
                  name="sportType"
                  value={formData.sportType}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Sport --</option>
                  <option value="Football">Football</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Rugby">Rugby</option>
                  <option value="Hockey">Hockey</option>
                  <option value="Tennis">Tennis</option>
                </select>
              </label>
              <label>
                City:
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </label>

              <div className="form-actions">
                <button type="submit">Create</button>
                <button type="button" onClick={() => setShowPopup(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Matches Section */}
      <UpcomingMatches />
    </main>
  );
}

export default ManagerHomepage;
