import { useNavigate } from "react-router-dom";

import ProfileCard from "../Components/ProfileCard"
import ProfileDetails from "../Components/ProfileDetails";

function UserProfile(){
    const navigate = useNavigate();
    return(
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)' }}>
            <button 
                style={{
                    margin: '1rem',
                    padding: '0.6rem 1rem',
                    borderRadius: '25px',
                    fontWeight: 600,
                    border: 'none',
                    background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                    color: 'white',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(255,107,53,0.10)'
                }}
                onClick={() => navigate('/home')}
            >
                ← Back to Home
            </button>
            <ProfileCard/>
            <ProfileDetails/>
        </div>
    )

}

export default UserProfile;
