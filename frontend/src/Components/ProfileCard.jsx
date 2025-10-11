import React, { useEffect, useState } from "react";
import "../Styles/Profile.css";
import Loading from "./Loading";

let baseURL = "https://prime-backend.azurewebsites.net";
//let baseURL = "http://localhost:3000";

function ProfileCard() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [picture, setPicture] = useState("");
  const [pictureFile, setPictureFile] = useState(null);
  const [location, setLocation] = useState("");
  const [memberSince, setMemberSince] = useState("");

    useEffect(() => {
      if (!pictureFile) return;
      const preview = URL.createObjectURL(pictureFile);
      setPicture(preview);
      return () => URL.revokeObjectURL(preview);
    }, [pictureFile]);

  function handlePictureChange(e) {
    const file = e.target.files[0];
    if (file) {
      setPictureFile(file);
      setPicture(URL.createObjectURL(file));
    }
  }

  async function uploadImage() {
    if (!pictureFile) return picture;
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("picture", pictureFile);
    const res = await fetch(baseURL + "/api/users/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return data.url;
  }

  async function handleSave() {
    const token = localStorage.getItem("token");
    try {
      const uploadedUrl = await uploadImage();
      const res = await fetch(baseURL + "/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          picture: uploadedUrl || picture,
          profile: {
            bio,
            location,
          }
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setIsEditing(false);
        setPictureFile(null);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(baseURL + "/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data.user);
      setUsername(data.user.username);
      setBio(data.user.profile?.bio || "");
      setPicture(data.user.picture || "");
      setLocation(data.user.profile?.location || "");

      const ts = data.user.createdAt;
      const memberYear = ts ? new Date(ts._seconds * 1000).getFullYear() : "";
      setMemberSince(memberYear);
      
    };
    fetchUser();
  }, []);

  if (!user) return <Loading/>;

  return (
    <section className="profile-card">
      <header>My Profile</header>
      <section className="profile-picture">
        <img src={picture} alt={username} className="picture" />
        {isEditing && (
          <input type="file" accept="image/*" onChange={handlePictureChange} data-testid="profile-file-input"/>
        )}
        <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </section>
      <section className="profile-info">
        {isEditing ? (
          <>
            <label>username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
              autoComplete="username"
              className="input-field"
            />
            <label>bio:</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="bio"
              required
              autoComplete="bio"
              className="input-field"
            />
            <label>location:</label>
             <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="input-field"
            />
            <button className="save-btn" onClick={handleSave}>
              Save
            </button>
          </>
        ) : (
          <>
          
            <h1 className="display-name">{username}</h1>
            <h2 className="bio">{bio || "No bio yet"}</h2>
            <h2 className="location"> {location || "Unknown"}</h2>
            <h4 className="member-since"> Member since: {memberSince}</h4>
          </>
        )}
      </section>
    </section>
  );
}

export default ProfileCard;
