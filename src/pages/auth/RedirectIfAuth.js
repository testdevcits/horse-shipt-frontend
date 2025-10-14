import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const RedirectIfAuth = ({ children }) => {
  const { user, loading } = useAuth(); // assume your AuthContext provides loading

  // Prevent flashing while auth state is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Checking authentication...
      </div>
    );
  }

  // If user is logged in, redirect based on their role
  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  // Otherwise, render children (login/signup pages)
  return children;
};

export default RedirectIfAuth;
