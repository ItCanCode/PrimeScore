import { useEffect, useState } from "react";
import "../Styles/Profile.css";

function ProfileCard() {
  
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState("");
    const [username, setUsername] = useState("");
    const [picture, setPicture] = useState("");

    function handlePictureChange(e) {
        
        const uploadedFile = e.target.files[0];
        
        if (uploadedFile) {
            const reader = new FileReader();
            reader.onload = () => setPicture(reader.result);
            reader.readAsDataURL(uploadedFile);
        }
    }

  async function handleSave() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          bio,
          picture,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user); 
        setIsEditing(false);
      } 
      else {
        console.error(data.error);
      }
    } 
    catch (err) {
        console.error(err);
    }
  }


  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:3000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUser(data.user);
      setUsername(data.user.username);
      setBio(data.user.profile?.bio || "");
      setPicture(data.user.picture || "");
    };

    fetchUser();
  }, []);

  if (!user) return <p>Loading ...</p>;

  return (
    <section className="profile-card">
      <header>My Profile</header>

      <section className="profile-picture">
        <img src={picture} alt={username} className="picture" />

        {isEditing && (
          <input type="file" accept="image/*" onChange={handlePictureChange} />
        )}

        <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </section>

      <section className="profile-info">
        {isEditing ? (
          <>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field"
            />
            <button className="save-btn" onClick={handleSave}>
              Save
            </button>
          </>
        ) : (
          <>
            <h1 className="display-name">{username}</h1>
            <p className="bio">{bio || "No bio yet"}</p>
          </>
        )}
      </section>
    </section>
  );
}

export default ProfileCard;
