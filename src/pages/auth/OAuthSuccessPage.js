import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { oauthLogin } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const role = params.get("role");
    const email = params.get("email") || "";
    const name = params.get("name") || "";
    const photo = params.get("photo") || "";
    const provider = params.get("provider") || "";
    const providerId = params.get("providerId") || "";

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
      });

      // Redirect to dashboard
      navigate(`/${role}/dashboard`, { replace: true });
    } else {
      // Redirect to login if missing info
      navigate("/login", { replace: true });
    }
  }, [location.search, oauthLogin, navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
      <p className="mt-3 text-sm">Logging in...</p>
    </div>
  );
};

export default OAuthSuccessPage;
