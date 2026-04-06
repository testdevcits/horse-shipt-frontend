import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "../../components/common/Toast";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { oauthLogin } = useAuth();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const role = params.get("role");
    const email = params.get("email") || "";
    const name = params.get("name") || "";
    const photo = params.get("photo") || "";
    const provider = params.get("provider") || "";
    const providerId = params.get("providerId") || "";
    const error = params.get("error");

    if (error) {
      // Show error toast and stop redirect
      setToast({ message: decodeURIComponent(error), type: "error" });
      setLoading(false);
      return;
    }

    if (token && role) {
      // Save user info in context
      oauthLogin({
        token,
        role,
        provider,
        providerId,
        email,
        name,
        photo,
        id: params.get("id") || "", // ensure _id exists
      });

      // Redirect to dashboard
      navigate(`/${role}/dashboard`, { replace: true });
    } else if (token && !role) {
      // Token exists but role missing
      setToast({
        message: "Role not found. Please login manually.",
        type: "error",
      });
      setLoading(false);
    } else {
      // No token
      navigate("/login", { replace: true });
    }
  }, [location.search, oauthLogin, navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
      {loading && (
        <>
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
          <p className="mt-3 text-sm">Logging in...</p>
        </>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => {
            setToast(null);
            // Optionally redirect user to login page after closing error
            navigate("/login", { replace: true });
          }}
        />
      )}
    </div>
  );
};

export default OAuthSuccessPage;
