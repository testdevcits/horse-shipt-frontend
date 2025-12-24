import React from "react";
import { Navigate } from "react-router-dom";
import { useDriverAuth } from "../contexts/DriverAuthContext";
import Toast from "../components/common/Toast";

const ProtectedDriverRoute = ({ children, redirectPath = "/driver/login" }) => {
  const { driver, token, logout } = useDriverAuth();

  if (!driver || !token) {
    // Not authenticated → redirect to driver login
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedDriverRoute;
