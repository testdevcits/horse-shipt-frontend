import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "../../components/common/Toast";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { oauthLogin } = useAuth();
  const [toast, setToast] = useState(null);

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
      setToast({ message: decodeURIComponent(error), type: "error" });
      return;
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

      navigate(`/${role}/dashboard`, { replace: true });
    } else if (token && !role) {
      setToast({
        message: "Role not found. Please login manually.",
        type: "error",
      });
      navigate("/login", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [location.search, oauthLogin, navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
      <p className="mt-3 text-sm">Logging in...</p>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default OAuthSuccessPage;
