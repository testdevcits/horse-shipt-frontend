import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "../../components/common/Toast";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const search = useLocation().search;
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");
    const role = params.get("role");
    const _id = params.get("_id") || "";
    const name = params.get("name") || "";
    const email = params.get("email") || "";
    const photo = params.get("photo") || "";
    const provider = params.get("provider") || "";
    const providerId = params.get("providerId") || "";
    const firstName = params.get("firstName") || "";
    const lastName = params.get("lastName") || "";
    const locale = params.get("locale") || "";
    const isLogin = params.get("isLogin") === "true"; // parse boolean
    const isActive = params.get("isActive") !== "false"; // default true

    if (token && role) {
      const userData = {
        _id,
        role,
        name,
        email,
        photo,
        provider,
        providerId,
        firstName,
        lastName,
        locale,
        isLogin,
        isActive,
      };

      // Save in context & localStorage
      login(userData, token, 3600);

      // Show toast first
      setToast({ message: "Logged in successfully!", type: "info" });

      // Redirect after a short delay
      setTimeout(() => {
        navigate(
          role === "shipper" ? "/shipper/dashboard" : "/customer/dashboard"
        );
      }, 1000);
    } else {
      setToast({
        message: "OAuth login failed. Redirecting...",
        type: "error",
      });
      setTimeout(() => navigate("/login"), 1500);
    }
  }, [search, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {toast ? (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      ) : (
        <p className="text-gray-600">Logging in...</p>
      )}
    </div>
  );
};

export default OAuthSuccessPage;
