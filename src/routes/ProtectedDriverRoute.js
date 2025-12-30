import React from "react";
import { Navigate } from "react-router-dom";
import { useDriverAuth } from "../contexts/DriverAuthContext";

const ProtectedDriverRoute = ({ children, redirectPath = "/driver/login" }) => {
  const { driver, token, loading } = useDriverAuth();

  // While auth state is loading, show a loader
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
        <p className="mt-3 text-sm">Loading driver data...</p>
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!driver || !token) {
    return <Navigate to={redirectPath} replace />;
  }

  // Authenticated → render children
  return children;
};

export default ProtectedDriverRoute;
