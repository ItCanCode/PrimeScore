// ProtectedLayout.jsx
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

const ProtectedLayout = () => {
  const { user } = useAuth();

  if (!user) {
    // Redirect to login if not logged in
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // Renders child routes
};

export default ProtectedLayout;
