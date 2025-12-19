import React, { useEffect, useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/common/Toast";

/**
 * Decode JWT and check expiry
 */
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true; // invalid token
  }
};

const ProtectedRoute = ({ children, role, redirectPath = "/login" }) => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  /**
   *  Check token on user activity
   */
  const checkTokenValidity = useCallback(async () => {
    if (!token || !user || isTokenExpired(token)) {
      await logout();
      navigate(redirectPath, { replace: true });
    }
  }, [token, user, logout, navigate, redirectPath]);

  /**
   * 🔹 Initial auth & role check
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user || !token) {
        setChecking(false);
        return;
      }

      if (isTokenExpired(token)) {
        logout();
        navigate(redirectPath, { replace: true });
        return;
      }

      if (role && user.role !== role) {
        setAccessDenied(true);

        const logoutTimer = setTimeout(async () => {
          await logout();
          navigate(redirectPath, { replace: true });
        }, 3000);

        return () => clearTimeout(logoutTimer);
      }

      setChecking(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [user, token, role, logout, navigate, redirectPath]);

  /**
   *  Event listeners (mouse, keyboard, click)
   */
  useEffect(() => {
    const events = ["mousemove", "keydown", "click"];

    events.forEach((event) =>
      window.addEventListener(event, checkTokenValidity)
    );

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, checkTokenValidity)
      );
    };
  }, [checkTokenValidity]);

  /**
   *  Loader
   */
  if (checking) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
        <p className="mt-3 text-sm">Checking access...</p>
      </div>
    );
  }

  /**
   *  Not authenticated
   */
  if (!user || !token) {
    return <Navigate to={redirectPath} replace />;
  }

  /**
   *  Role access denied
   */
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

  /**
   *  Authorized
   */
  return children;
};

export default ProtectedRoute;
