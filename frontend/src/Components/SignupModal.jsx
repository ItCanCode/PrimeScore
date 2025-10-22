import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

function SignupModal({ closeModal, setModalType }) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch("https://prime-backend.azurewebsites.net/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          action: "signup"
        }),
      });

      const data = await res.json();

      if (data.message === "Signup successful") {
        const proceed = window.confirm("✅ Signup successful! Click OK to go to your dashboard.");
        if (proceed) {
          navigate("/home", { state: { role: "viewer" } });
        }
      } else if (data.message === "User already exists") {
        const goLogin = window.confirm("⚠️ You already have an account. Do you want to log in instead?");
        if (goLogin) setModalType('login');
      } else {
        window.alert("❌ Signup failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      window.alert("❌ Signup failed due to a network or server error. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  const handleFacebookSignup = () => alert('Facebook sign up not implemented yet.');

  return (
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

        <div className="divider">
          <span>Sign up with</span>
        </div>

        <div className="social-login">
          <button className="social-btn" type="button" onClick={handleGoogleSignup} disabled={googleLoading}>
            {googleLoading ? (
              <>
                <span className="google-spinner" /> Signing up...
              </>
            ) : (
              <>
                <FcGoogle size={20} style={{ marginRight: 8 }} /> Continue with Google
              </>
            )}
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
}

export default SignupModal;
