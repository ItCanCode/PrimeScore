import React, { useState, useEffect } from 'react';
import '../Styles/WelcomePage.css';
import LoginModal from '../Components/LoginModal.jsx';
import SignupModal from '../Components/SignupModal.jsx';

function WelcomePage() {

  const [modalType, setModalType] = useState('none');
  const [user, _setUser] = useState(null);
  const [_error, _setError] = useState(null);
  const [loading, setLoading] = useState(true);
    // Simulate loading
  useEffect(() => {
    // Replace with actual loading logic (e.g., fetch user)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // 1.5 seconds delay for demo

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          {/* Spinning loader */}
          <div className="loader-wrapper">
            <div className="loader main"></div>
            <div className="loader overlay"></div>
          </div>

          {/* Loading text */}
          <div className="loading-text">Loading ...</div>

          {/* Animated dots */}
          <div className="dots">
            <div className="dot blue"></div>
            <div className="dot purple"></div>
            <div className="dot indigo"></div>
          </div>
        </div>
      </div>
    );
  }
 

  const openModal = (type) => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType('none');
  };

  if (user) {
    return (
      <div>
        <h2>Welcome, {user.displayName}!</h2>
        <p>Email: {user.email}</p>
        <img src={user.photoURL} alt="profile" />
      </div>
    );
  }

  return (
    <div className="body">
      <nav>
        <div className="nav-container">
          <div className="logo">PrimeScore</div>

          <ul className="nav-links">
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#sports">Sports</a>
            </li>
            <li>
              <a href="#news">News</a>
            </li>
            <li>
              <a href="#events">Events</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>

          <div className="auth-buttons">
            <button
              className="auth-btn login-btn"
              onClick={() => openModal('login')}
              type="button"
            >
              Login
            </button>
            <button
              className="auth-btn signup-btn"
              onClick={() => openModal('signup')}
              type="button"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-bg"></div>
        <div className="floating-icon icon-1">⚽</div>
        <div className="floating-icon icon-2">🏀</div>
        <div className="floating-icon icon-3">🏈</div>
        <div className="floating-icon icon-4">🎾</div>

        <div className="hero-content">
          <h1>PRIME SCORE</h1>
          <p>Where Champions rise and Legends Are Born</p>
          <a href="#sports" className="cta-button">
            Enjoy Sports
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#sports">Sports</a>
            <a href="#news">Latest News</a>
            <a href="#events">Upcoming Events</a>
          </div>
          <div className="footer-section">
            <h4>Popular Sports</h4>
            <a href="#">Football/Soccer</a>
            <a href="#">Basketball</a>
            <a href="#">Tennis</a>
            <a href="#">American Football</a>
          </div>
          <div className="footer-section">
            <h4>Community</h4>
            <a href="#">Join Our Team</a>
            <a href="#">Become a Coach</a>
            <a href="#">Fan Community</a>
            <a href="#">Sponsorship</a>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <a href="#">Social Media</a>
            <a href="#">Newsletter</a>
            <a href="#">Contact Us</a>
            <a href="#">Support</a>
          </div>
        </div>
        <p>&copy; PrimeScore. All rights reserved. Where passion meets performance.</p>
      </footer>

      {/* Conditionally render modals */}
      {modalType === 'login' && (
        <LoginModal
          closeModal={closeModal}
          setModalType={setModalType}
        />
      )}
      {modalType === 'signup' && (
        <SignupModal
          closeModal={closeModal}
          setModalType={setModalType}
        />
      )}
    </div>
  );
}

export default WelcomePage;
