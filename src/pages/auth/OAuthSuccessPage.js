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

    // Extract user data from query params
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
    const isLogin = params.get("isLogin") === "true";
    const isActive = params.get("isActive") !== "false";

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

      // Store in context & localStorage
      const authData = {
        authToken: token,
        authUser: userData,
        token,
        tokenExpiry: Date.now() + 3600 * 1000, // 1 hour
      };
      localStorage.setItem("authData", JSON.stringify(authData));
      login(userData, token, 3600);

      // Show toast
      setToast({ message: "Logged in successfully!", type: "info" });

      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate(
          role === "shipper" ? "/shipper/dashboard" : "/customer/dashboard"
        );
      }, 1000);
    } else {
      // Handle failed OAuth
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
