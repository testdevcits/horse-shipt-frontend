import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "../../components/common/Toast";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { oauthLogin } = useAuth();

  const getRoleFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const token = params.get("token");
    let role = params.get("role");

    const email = params.get("email") || "";
    const name = params.get("name") || "";
    const photo = params.get("photo") || "";
    const provider = params.get("provider") || "";
    const providerId = params.get("providerId") || "";
    const error = params.get("error");

    if (error) {
      Toast.error(decodeURIComponent(error));

      setTimeout(() => {
        navigate("/oauth-error", { replace: true });
      }, 1500);
      return;
    }

    if (token && !role) {
      role = getRoleFromToken(token);
    }

    if (token && role) {
      oauthLogin({
        token,
        role,
        provider,
        providerId,
        email,
        name,
        photo,
      });

      window.history.replaceState({}, document.title, "/oauth-success");

      setTimeout(() => {
        navigate(`/${role}/dashboard`, { replace: true });
      }, 1200);

      return;
    }

    Toast.error("Login failed. Please try again");

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1500);
  }, [location.search, oauthLogin, navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
      <p className="mt-3 text-sm">Logging you in...</p>
    </div>
  );
};

export default OAuthSuccessPage;
