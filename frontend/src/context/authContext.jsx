/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  useEffect(() => {
  console.log("🔑 AuthContext Mounted");
  console.log("Initial User from localStorage:", user);
  console.log("Initial Token from localStorage:", token);
}, []);
  const [user, setUser] = useState(() => {
    // Load from localStorage if available
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const login = (userData, idToken) => {
    setUser(userData);
    setToken(idToken);
    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", idToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Clear from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Optional: keep state synced with localStorage if it changes manually
  useEffect(() => {
    if (!user || !token) return;
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  }, [user, token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
