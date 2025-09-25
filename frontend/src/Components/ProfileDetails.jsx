import { useState, useEffect } from "react";
import "../Styles/Profile.css";

function ProfileDetails() {
  const [favoriteSports, setFavoriteSports] = useState([]);
  const [favoriteTeam, setFavoriteTeam] = useState("");      
  const [favoritePlayer, setFavoritePlayer] = useState("");  
  const [isEditing, setIsEditing] = useState(false);

  let baseURL = "https://prime-backend.azurewebsites.net"
  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(baseURL + "/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFavoriteSports(data.user.profile?.favoriteSports || []);
        setFavoriteTeam(data.user.profile?.favoriteTeam || "");      
        setFavoritePlayer(data.user.profile?.favoritePlayer || "");  
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };
    fetchUser();
  }, []);

  // Save updated profile
  async function handleSave() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(baseURL + "/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          profile: {
            favoriteSports,
            favoriteTeam,
            favoritePlayer
          }
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsEditing(false);
      } else {
        console.error("Failed to save details:", data.error);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  }

  // Toggle selection for sports
  function toggleSelection(arr, setArr, value) {
    if (arr.includes(value)) {
      setArr(arr.filter((v) => v !== value));
    } else {
      setArr([...arr, value]);
    }
  }

  return (
    <section className="profile-details">
      <header>Sports & Interests</header>

      {isEditing ? (
        <>
          {/* Favorite Sports */}
          <section className="selection-group">
            <label>Favorite Sport:</label>
            {["Football", "Basketball", "Tennis", "Cricket"].map((sport) => (
              <button
                key={sport}
                type="button"
                className={favoriteSports.includes(sport) ? "selected" : ""}
                onClick={() => toggleSelection(favoriteSports, setFavoriteSports, sport)}
              >
                {sport}
              </button>
            ))}
          </section>

          {/* Favorite Team */}
          <section className="selection-group">
            <label>Favorite Team:</label>
            <input
              type="text"
              value={favoriteTeam}
              onChange={(e) => setFavoriteTeam(e.target.value)}
              className="input-field"
              placeholder="e.g. Real Madrid"
            />
          </section>

          {/* Favorite Player */}
          <section className="selection-group">
            <label>Favorite Player:</label>
            <input
              type="text"
              value={favoritePlayer}
              onChange={(e) => setFavoritePlayer(e.target.value)}
              className="input-field"
              placeholder="e.g. Cristiano Ronaldo"
            />
          </section>

          {/* Action Buttons */}
          <button className="save-btn" onClick={handleSave}>Save</button>
          <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <section className="info-cards">
            <section className="info-card">
              <p>
                <span className="label">Favorite Sports:</span>{" "}
                <span className="value">{favoriteSports.join(", ") || "sportsA"}</span>
              </p>
            </section>

            <section className="info-card">
              <p>
                <span className="label">Favourite Team:</span>{" "}
                <span className="value">{favoriteTeam || "teamA"}</span>
              </p>
            </section>

            <section className="info-card">
              <p>
                <span className="label">Favorite Player:</span>{" "}
                <span className="value">{favoritePlayer || "playerA"}</span>
              </p>
            </section>
          </section>
          
      
          <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Details</button>
        </>
      )}
    </section>
  );
}

export default ProfileDetails;
