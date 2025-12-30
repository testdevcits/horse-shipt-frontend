import React from "react";
import { Navigate } from "react-router-dom";
import { useDriverAuth } from "../contexts/DriverAuthContext";

const ProtectedDriverRoute = ({ children, redirectPath = "/driver/login" }) => {
  const { driver, token } = useDriverAuth(); // removed logout

  if (!driver || !token) {
    // Not authenticated → redirect to driver login
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedDriverRoute;
