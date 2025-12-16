import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RequireRole = ({ roles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    // If user has a different role, send them to their default dashboard
    if (user.role === "moderator") {
      return <Navigate to="/admin/moderation" replace />;
    }
    // default to admin dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default RequireRole;


