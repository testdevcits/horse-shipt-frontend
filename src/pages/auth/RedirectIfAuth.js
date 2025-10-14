import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const RedirectIfAuth = ({ children }) => {
  const { user } = useAuth();

  // If user is logged in, redirect based on their role
  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  // Otherwise, render children (login/signup pages)
  return children;
};

export default RedirectIfAuth;
