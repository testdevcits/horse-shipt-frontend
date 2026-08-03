import React from "react";
import { Navigate } from "react-router-dom";
import { useDriverAuth } from "../contexts/DriverAuthContext";
import PageLoader from "../components/common/PageLoader";

const ProtectedDriverRoute = ({ children, redirectPath = "/driver/login" }) => {
  const { driver, token, loading } = useDriverAuth();

  // While auth state is loading, show a loader
  if (loading) {
    return <PageLoader text="Checking access..." fullScreen />;
  }

  // Not authenticated → redirect to login
  if (!driver || !token) {
    return <Navigate to={redirectPath} replace />;
  }

  // Authenticated → render children
  return children;
};

export default ProtectedDriverRoute;
