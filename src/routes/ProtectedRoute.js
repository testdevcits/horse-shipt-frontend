import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/common/Toast";

const ProtectedRoute = ({ children, role }) => {
  const { user, token, logout } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);
  const [redirect, setRedirect] = useState(false);

  // Check role access
  useEffect(() => {
    if (user && role && user.role !== role) {
      setAccessDenied(true);

      // Auto logout & redirect after 3 seconds
      const timer = setTimeout(() => {
        logout();
        setRedirect(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, role, logout]);

  // Token validation handled in AuthContext
  if (!user || !token) return <Navigate to="/login" replace />;

  if (redirect) return <Navigate to="/login" replace />;

  if (role && user.role !== role && accessDenied) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Toast
          message="You do not have access to this page. Redirecting..."
          type="error"
        />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
