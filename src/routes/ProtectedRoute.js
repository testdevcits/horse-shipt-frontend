import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/common/Toast";

const ProtectedRoute = ({ children, role }) => {
  const { user, token, logout } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    // If user exists but role is not allowed
    if (user && role && user.role !== role) {
      setAccessDenied(true);

      // Auto logout & redirect after 3 seconds
      const timer = setTimeout(() => {
        logout(); // clear user & token
        setRedirect(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, role, logout]);

  // If not logged in, redirect to login
  if (!user || !token) return <Navigate to="/login" replace />;

  // If access denied and timer finished, redirect to login
  if (redirect) return <Navigate to="/login" replace />;

  // Show access denied toast
  if (role && user.role !== role && accessDenied) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Toast
          message="🚫 You do not have access to this page. Redirecting..."
          type="error"
        />
      </div>
    );
  }

  // Otherwise render the children components
  return children;
};

export default ProtectedRoute;
