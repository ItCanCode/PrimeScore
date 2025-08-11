import React, { useState } from 'react';
import '../Styles/WelcomePage.css';

function WelcomePage() {
  // Modal state: 'none', 'login', or 'signup'
  const [modalType, setModalType] = useState('none');

  const openModal = (type) => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType('none');
  };

  // Modal content components

  const LoginModal = () => (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
      <div className="modal-content">
        <button
          className="close"
          aria-label="Close login modal"
          onClick={closeModal}
          type="button"
        >
          &times;
        </button>

        <div className="modal-header">
          <h2 id="loginTitle" className="modal-title">Welcome Back!</h2>
          <p className="modal-subtitle">Sign in to your PrimeScore account</p>
        </div>

        <form id="loginForm" onSubmit={(e) => { e.preventDefault(); alert('Login submitted!'); }}>
          <div className="form-group">
            <label htmlFor="loginEmail">Email</label>
            <input
              type="email"
              id="loginEmail"
              name="email"
              placeholder="Enter your Email"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="loginPassword">Password</label>
            <input
              type="password"
              id="loginPassword"
              name="password"
              placeholder="Enter your Password"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="submit-btn">Sign In</button>
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-login">
          <button className="social-btn" type="button" onClick={() => alert('Google login')}>
            <span>🌐</span> Continue with Google
          </button>
          <button className="social-btn" type="button" onClick={() => alert('Facebook login')}>
            <span>📘</span> Continue with Facebook
          </button>
        </div>

        <div className="modal-footer">
          Don't have an account?{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => setModalType('signup')}
          >
            Sign up here
          </button>
        </div>
      </div>
    </div>
  );
const SignupModal = () => (
  <div className="modal" role="dialog" aria-modal="true" aria-labelledby="signupTitle">
    <div className="modal-content">
      <button
        className="close"
        aria-label="Close signup modal"
        onClick={closeModal}
        type="button"
      >
        &times;
      </button>

      <div className="modal-header">
        <h2 id="signupTitle" className="modal-title">Join PrimeScore!</h2>
        <p className="modal-subtitle">Create your account to get started</p>
      </div>

      <form id="signupForm" onSubmit={(e) => { e.preventDefault(); alert('Sign up submitted!'); }}>
        <div className="form-group">
          <label htmlFor="signupEmail">Email</label>
          <input
            type="email"
            id="signupEmail"
            name="email"
            placeholder="Enter your Email"
            required
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="signupPassword">Password</label>
          <input
            type="password"
            id="signupPassword"
            name="password"
            placeholder="Create a Password"
            required
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="submit-btn">Sign Up</button>
      </form>

      <div className="divider">
        <span>or continue with</span>
      </div>

      {/* Social login buttons for Sign Up */}
      <div className="social-login">
        <button className="social-btn" type="button" onClick={() => alert('Google sign up')}>
          <span>🌐</span> Continue with Google
        </button>
        <button className="social-btn" type="button" onClick={() => alert('Facebook sign up')}>
          <span>📘</span> Continue with Facebook
        </button>
      </div>

      <div className="modal-footer">
        Already have an account?{' '}
        <button
          type="button"
          className="link-button"
          onClick={() => setModalType('login')}
        >
          Sign in here
        </button>
      </div>
    </div>
  </div>
);

  return (
    <div className="body">
      <nav>
        <div className="nav-container">
          <div className="logo">PrimeScore</div>

          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#sports">Sports</a></li>
            <li><a href="#news">News</a></li>
            <li><a href="#events">Events</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
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
          <a href="#sports" className="cta-button">Enjoy Sports</a>
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
      {modalType === 'login' && <LoginModal />}
      {modalType === 'signup' && <SignupModal />}
    </div>
  );
}

export default WelcomePage;
