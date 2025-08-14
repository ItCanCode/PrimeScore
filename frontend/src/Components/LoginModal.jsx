import React from 'react';
import { FcGoogle } from 'react-icons/fc';        // Google icon (colorful)
 import { FaFacebookF } from 'react-icons/fa';

const LoginModal = ({ closeModal, handleGoogleLogin, setModalType }) => (
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

      <form
        id="loginForm"
        onSubmit={(e) => {
          e.preventDefault();
          alert('Login submitted!');
        }}
      >
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
        <button className="social-btn" type="button" onClick={handleGoogleLogin}>
          <span> <FcGoogle size={20} style={{ marginRight: 8 }} /></span> Continue with Google
        </button>
        <button
          className="social-btn"
          type="button"
          onClick={() => alert('Facebook login')}
         style={{ color: '#1877F2' }}
        >
          <span><FaFacebookF size={20} style={{ marginRight: 8 }}/></span> Continue with Facebook
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

export default LoginModal;
