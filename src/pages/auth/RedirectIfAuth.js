import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import PageLoader from "../../components/common/PageLoader";

const RedirectIfAuth = ({ children, redirectPath }) => {
  const { user, token, loading } = useAuth(); // include token to ensure login is valid

  // Prevent flashing while auth state is being determined
  if (loading) {
    return (
      <PageLoader
        text="Checking authentication..."
        fullScreen={false} // makes it cover the whole screen
        size={28} // size of cubes
        color="#BF9B53" // loader color
      />
    );
  }

  // If user is logged in and token exists, redirect based on role
  if (user && token) {
    const path = redirectPath || `/${user.role}/dashboard`;
    return <Navigate to={path} replace />;
  }

  // Otherwise, render children (login/signup pages)
  return children;
};

export default RedirectIfAuth;
