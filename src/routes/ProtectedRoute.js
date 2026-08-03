import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/common/Toast";
import PageLoader from "../components/common/PageLoader";

const ProtectedRoute = ({ children, role, redirectPath = "/login" }) => {
  const { user, token, logout } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Small delay to ensure context is updated (especially for OAuth)
    const timer = setTimeout(() => {
      if (!user || !token) {
        // Not logged in → redirect immediately
        setChecking(false);
        return;
      }

      if (role && user.role !== role) {
        // Role mismatch → show access denied
        setAccessDenied(true);

        // Auto logout & redirect after 3 seconds
        const logoutTimer = setTimeout(async () => {
          await logout();
          setAccessDenied(false);
        }, 3000);

        return () => clearTimeout(logoutTimer);
      }

      setChecking(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [user, token, role, logout]);

  // Loading indicator while checking auth
  if (checking) {
    return <PageLoader text="Checking access..." fullScreen />;
  }

  // Redirect to login if not authenticated
  if (!user || !token) return <Navigate to={redirectPath} replace />;

  // Show access denied toast if role doesn't match
  if (accessDenied) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Toast
          message="You do not have access to this page. Logging out..."
          type="error"
        />
      </div>
    );
  }

  // User has access → render children
  return children;
};

export default ProtectedRoute;
