/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";
import { auth } from "../firebase"; // adjust path if needed
import { onAuthStateChanged, signOut } from "firebase/auth";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // track Firebase init

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
        });
        // Optionally save to localStorage if you still want persistence
        localStorage.setItem("user", JSON.stringify(currentUser));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
      setLoading(false); // Firebase finished initializing
    });

    return () => unsubscribe(); // cleanup listener
  }, []);

  const login = (userData) => setUser(userData); // optional if using Firebase signIn
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
