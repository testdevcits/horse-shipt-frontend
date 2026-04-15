import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const OAuthSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { oauthLogin } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const token = params.get("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const user = {
      _id: params.get("id"),
      role: params.get("role") || "customer",
      name: params.get("name"),
      email: params.get("email"),
      photo: params.get("photo") || "",
    };

    oauthLogin({ token, ...user });

    setTimeout(() => {
      navigate(
        user.role === "shipper" ? "/shipper/dashboard" : "/customer/dashboard",
        { replace: true }
      );
    }, 1500);
  }, [location.search, navigate, oauthLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        {/* Loader */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 border-4 border-[#BF9B53] border-t-transparent rounded-full animate-spin"></div>
        </div>

        <h2 className="text-lg font-semibold text-gray-800">
          Logging you in...
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          Please wait while we redirect you
        </p>
      </div>
    </div>
  );
};

export default OAuthSuccessPage;
