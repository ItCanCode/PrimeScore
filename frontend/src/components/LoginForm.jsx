import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User,Facebook, Globe } from 'lucide-react';

import './LoginForm.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const error = true;

  const handleGoogleLogin = () => {
    // TODO: Add Google OAuth login logic here
    alert('Google login clicked');
  };

  const handleFacebookLogin = () => {
    // TODO: Add Facebook OAuth login logic here
    alert('Facebook login clicked');
  };

  return (
    <>
      <form className="login-form" >
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button type="submit">Login</button>
      </form>

      <div className="social-login">
        <button type="button" className="google-login" onClick={handleGoogleLogin}>
          <Facebook size={18} style={{ marginRight: 8 }} />
          Login with Google
        </button>

        <button type="button" className="facebook-login" onClick={handleFacebookLogin}>
          <Globe size={18} style={{ marginRight: 8 }} />
          Login with Facebook
        </button>
      </div>
    </>
  );
}
