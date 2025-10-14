import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/common/Toast";

const ProtectedRoute = ({ children, role }) => {
  const { user, token, logout } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [checking, setChecking] = useState(true); // Wait until auth is ready

  useEffect(() => {
    // Delay checking to ensure OAuth login has updated the context
    const timer = setTimeout(() => {
      if (!user || !token) {
        setRedirect(true);
      } else if (role && user.role !== role) {
        setAccessDenied(true);

        // Auto logout & redirect after 3 seconds
        const logoutTimer = setTimeout(() => {
          logout();
          setRedirect(true);
        }, 3000);

        return () => clearTimeout(logoutTimer);
      }
      setChecking(false);
    }, 100); // small delay to allow OAuth login to finish

    return () => clearTimeout(timer);
  }, [user, token, role, logout]);

  // Show loading while checking auth
  if (checking) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
        <p className="mt-3 text-sm">Checking access...</p>
      </div>
    );
  }

  // Redirect if no user or token
  if (!user || !token || redirect) return <Navigate to="/login" replace />;

  // Show access denied message
  if (accessDenied) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Toast
          message="🚫 You do not have access to this page. Redirecting..."
          type="error"
        />
      </div>
    );
  }

  // Otherwise render children
  return children;
};

export default ProtectedRoute;
