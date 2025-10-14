import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    // --- Handle error from OAuth redirect ---
    if (error) {
      console.error("OAuth Error:", decodeURIComponent(error));
      navigate(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!token) {
      navigate("/login");
      return;
    }

    // --- Build user object safely ---
    const userData = {
      _id: params.get("id") || "",
      role: params.get("role") || "customer", // default fallback
      name: params.get("name") || "",
      email: params.get("email") || "",
      photo: params.get("photo") || "",
      provider: params.get("provider") || "",
      providerId: params.get("providerId") || "",
      firstName: params.get("firstName") || "",
      lastName: params.get("lastName") || "",
      locale: params.get("locale") || "",
    };

    // --- Save auth data to localStorage ---
    const authData = {
      authToken: token,
      authUser: userData,
      token,
      tokenExpiry: Date.now() + 3600 * 1000, // 1 hour
    };
    localStorage.setItem("authData", JSON.stringify(authData));

    // --- Update AuthContext ---
    login(userData, token, 3600);

    // --- Redirect based on user role ---
    setTimeout(() => {
      navigate(
        userData.role === "shipper"
          ? "/shipper/dashboard"
          : "/customer/dashboard"
      );
    }, 500); // slight delay for smoother transition
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 text-sm">
      <div className="p-4 bg-white shadow rounded-lg">
        Logging in via Google... Please wait.
      </div>
    </div>
  );
};

export default OAuthSuccessPage;
