import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';

const SignupModal = ({
  closeModal,
  setModalType,
  handleGoogleSignup = () => alert('Google sign up'),
  handleFacebookSignup = () => alert('Facebook sign up'),
}) => (
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

      <form
        id="signupForm"
        onSubmit={(e) => {
          e.preventDefault();
          alert('Sign up submitted!');
        }}
      >
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

      <div className="social-login">
        <button className="social-btn" type="button" onClick={handleGoogleSignup}>
          <FcGoogle size={20} style={{ marginRight: 8 }} /> Continue with Google
        </button>
        <button
          className="social-btn"
          type="button"
          onClick={handleFacebookSignup}
          style={{ color: '#1877F2' }}
        >
          <FaFacebookF size={20} style={{ marginRight: 8 }} /> Continue with Facebook
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

export default SignupModal;
