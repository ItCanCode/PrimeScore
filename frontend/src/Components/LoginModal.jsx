import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/useAuth.js";


function LoginModal({ closeModal, setModalType }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch("https://prime-backend.azurewebsites.net/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          action: "login"
        }),
      });

      const data = await res.json();
      const role = data.user?.role;

      if (data.message === "Login successful") {
        localStorage.setItem("token", idToken);
        login(data.user, idToken);

        // Confirmation after successful login
        const proceed = window.confirm(" Login successful! Click OK to continue to your dashboard.");
        if (proceed) {
          navigate("/home", { state: { role } });
        }
      } else if (data.message === "User not found") {
        const signUp = window.confirm("You don’t have an account. Do you want to sign up?");
        if (signUp) {
          setModalType('signup');
        }
      } else {
        window.alert(" Login failed. Please try again.");
      }

    } catch (err) {
      console.error(err);
      window.alert(" Login failed due to a network or server error. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
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

        <div className="divider">
          <span>Sign in with</span>
        </div>

        <div className="social-login">
          <button className="social-btn" type="button" onClick={handleGoogleLogin} disabled={googleLoading}>
            {googleLoading ? (
              <>
                <span className="google-spinner" /> Signing in...
              </>
            ) : (
              <>
                <FcGoogle size={20} style={{ marginRight: 8 }} /> Continue with Google
              </>
            )}
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
}

export default LoginModal;
