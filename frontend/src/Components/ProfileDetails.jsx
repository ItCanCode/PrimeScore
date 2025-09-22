import { useState, useEffect } from "react";
import "../Styles/Profile.css";

function ProfileDetails() {
  const [favoriteSports, setFavoriteSports] = useState([]);
  const [favoriteTeam, setFavoriteTeam] = useState("");      
  const [favoritePlayer, setFavoritePlayer] = useState("");  
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("https://prime-backend.azurewebsites.net/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFavoriteSports(data.user.profile?.favoriteSports || []);
      setFavoriteTeam(data.user.profile?.favoriteTeams?.[0] || "");      
      setFavoritePlayer(data.user.profile?.favoritePlayers?.[0] || "");  
    };
    fetchUser();
  }, []);

  async function handleSave() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch("https://prime-backend.azurewebsites.net/api/users/me", {
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
    console.error(err);
  }
}


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
          <section className="selection-group">
            <label>Favorite Sport:</label>
            {["Football","Basketball","Tennis","Cricket"].map((sport) => (
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

          <button className="save-btn" onClick={handleSave}>Save</button>
          <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <p>Favorite Sports: {favoriteSports.join(", ") || "Sport type"}</p>
          <p>Favorite Team: {favoriteTeam || "Add your favourite team"}</p>
          <p>Favorite Player: {favoritePlayer || "Add your favourite player"}</p>
          <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Details</button>
        </>
      )}
    </section>
  );
}

export default ProfileDetails;
