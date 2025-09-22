import { useNavigate } from "react-router-dom";

import ProfileCard from "../Components/ProfileCard";


function UserProfile() {
//   const { user } = useContext(AuthContext);
//   const role = user?.role; // Safe access
//   console.log(role);

  const navigate = useNavigate();
//   const handleNavigation = (path) => navigate(path);

//   if (!user) {
//     return <p style={{ color: "white", textAlign: "center" }}>Loading user profile...</p>;
//   }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
      }}
    >
      <button
        style={{
          margin: "1rem",
          padding: "0.6rem 1rem",
          borderRadius: "25px",
          fontWeight: 600,
          border: "none",
          background: "linear-gradient(45deg, #ff6b35, #f7931e)",
          color: "white",
          fontSize: "1rem",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(255,107,53,0.10)",
        }}
        onClick={() => navigate(-1)}
      >
        ← Back to Home
      </button>

      <ProfileCard />
    </div>
  );
}

export default UserProfile;
