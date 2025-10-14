import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Build user object from OAuth query params
    const userData = {
      _id: params.get("id"),
      role: params.get("role"),
      name: params.get("name"),
      email: params.get("email"),
      photo: params.get("photo") || "",
      provider: params.get("provider"),
      providerId: params.get("providerId"),
      firstName: params.get("firstName") || "",
      lastName: params.get("lastName") || "",
      locale: params.get("locale") || "",
    };

    // Save auth data in localStorage
    const authData = {
      authToken: token,
      authUser: userData,
      token,
      tokenExpiry: Date.now() + 3600 * 1000,
    };
    localStorage.setItem("authData", JSON.stringify(authData));

    // Call AuthContext login to update state
    login(userData, token, 3600);

    // Redirect based on role
    navigate(
      userData.role === "shipper" ? "/shipper/dashboard" : "/customer/dashboard"
    );
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      Logging in...
    </div>
  );
};

export default OAuthSuccessPage;
