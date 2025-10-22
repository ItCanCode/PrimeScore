import React, { useState, } from 'react';
import ConfirmModal from '../Components/ConfirmModal.jsx';
import '../Styles/Home.css';
// import Loading from '../Components/Loading.jsx';
import News from '../Components/News.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

function HomePage() {
  const location = useLocation();
  const role = location.state?.role || 'viewer'; // Default to 'viewer' if no role
  console.log('HomePage role:', role);

  const [_error, _setError] = useState(null);
  // const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // Loading simulation
  // useEffect(() => {
  //   const timer = setTimeout(() => setLoading(false), 1500);
  //   return () => clearTimeout(timer);
  // }, []);



  const confirmLogout = () => {
    localStorage.removeItem("authToken");
    setShowLogoutModal(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // if (loading) {
  //   return <Loading />;
  // }

  return (
    <div className="home">
      {/* Logout confirmation modal */}
      <ConfirmModal
        show={showLogoutModal}
        onClose={cancelLogout}
        confirmAction={confirmLogout}
        confirmData={{}}
        title="Log Out"
        message="Are you sure you want to log out?"
      />

      {/* Hero / News Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="news-dashboard">
            <h2 className="news-dashboard-title">Latest Sports News</h2>
            <News />
          </div>
        </div>

        {/* Floating Sports Icons */}
        <div className="floating-icon icon-1">⚽</div>
        <div className="floating-icon icon-2">🏀</div>
        <div className="floating-icon icon-3">🏈</div>
        <div className="floating-icon icon-4">🎾</div>
        <div className="floating-icon icon-5">🏸</div>
        <div className="floating-icon icon-6">🏓</div>
      </section>
    </div>
  );
}

export default HomePage;
