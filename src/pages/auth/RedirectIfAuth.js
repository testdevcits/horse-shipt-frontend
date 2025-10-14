import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const RedirectIfAuth = ({ children }) => {
  const { user, token, loading } = useAuth(); // include token to ensure login is valid

  // Prevent flashing while auth state is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
        <p className="mt-3 text-sm">Checking authentication...</p>
      </div>
    );
  }

  // If user is logged in and token exists, redirect based on role
  if (user && token) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  // Otherwise, render children (login/signup pages)
  return children;
};

export default RedirectIfAuth;
