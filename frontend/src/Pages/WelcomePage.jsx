import React, { useState, useEffect } from 'react';
import '../Styles/WelcomePage.css';
import LoginModal from '../Components/LoginModal.jsx';
import SignupModal from '../Components/SignupModal.jsx';
import Loading from '../Components/Loading.jsx';




function WelcomePage() {
  const [modalType, setModalType] = useState('none');
  const [user, _setUser] = useState(null);
  const [_error, _setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Close mobile menu when window resizes to larger screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 576) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('nav')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  if (loading) {
    return <Loading />;
  }

  const openModal = (type) => {
    setModalType(type);
    setMobileMenuOpen(false); // Close mobile menu when opening modal
  };

  const closeModal = () => {
    setModalType('none');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  //   const closeMobileMenu = () => {
  //   setMobileMenuOpen(false);
  // };


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
          <div className="nav-top">
            <div className="logo">PrimeScore</div>
            <button 
              className="mobile-menu-toggle" 
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          <ul className={`nav-links ${mobileMenuOpen ? 'mobile-nav-open' : ''}`}>


            {/* <li>
              <Link to="/sports" onClick={closeMobileMenu}>Sports</Link>
            </li> */}
            {/* <li>
              <Link to="/news" onClick={closeMobileMenu}>News</Link>
            </li> */}
            {/* <li>
              <a href="#contact" onClick={closeMobileMenu}>Contact</a>
            </li> */}



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
        <div className="hero-content">
          <h1>PRIME SCORE</h1>
          <p>Where Champions rise and Legends Are Born</p>
        </div>
      </section>

      {/* Footer */}
      <footer>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <a>WhatsApp us at 0123456780</a>
            <a>Send us an email at:</a>
            <a>sportfacility3@gmail.com</a>
          </div>
        <p>&copy; PrimeScore. All rights reserved. Where passion meets performance.</p>
      </footer>

      {/* Rate Us Button - Fixed Bottom Right */}
      <a 
        href="https://docs.google.com/forms/d/1irHNT1aGeJmUG346bLl7Sw_kvbqYQcthBtSF2knDaLM/viewform?edit_requested=true#responses"
        target="_blank"
        rel="noopener noreferrer"
        className="rate-us-btn"
        title="Rate Our App"
      >
        ⭐ Rate Us
      </a>

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