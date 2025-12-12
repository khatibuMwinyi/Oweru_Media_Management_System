import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Optionally render a spinner or loading indicator
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireAuth;
