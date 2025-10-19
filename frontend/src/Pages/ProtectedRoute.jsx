
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // While loading, you can show nothing or a loader
  if (loading) {
    return <div>Loading...</div>;
  }

  // If no user is logged in, redirect to welcome page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
