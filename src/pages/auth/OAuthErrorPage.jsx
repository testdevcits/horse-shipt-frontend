import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import loginBg from "../../assets/images/authPage.jpg";
import { FaRegUser } from "react-icons/fa";

const OAuthErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const msg = params.get("message");

    let finalMessage = "Something went wrong";

    if (msg) {
      const decoded = decodeURIComponent(msg);

      if (decoded.includes("shipper")) {
        finalMessage =
          "This account belongs to a Shipper. Please select correct role.";
      } else if (decoded.includes("customer")) {
        finalMessage =
          "This account belongs to a Customer. Please select correct role.";
      } else {
        finalMessage = decoded;
      }
    }

    const timer = setTimeout(() => {
      setMessage(finalMessage);
      setLoading(false);

      window.history.replaceState({}, document.title, "/oauth-error");
    }, 3000);

    return () => clearTimeout(timer);
  }, [location.search]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover  bg-center p-4 font-montserrat "
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="bg-white/20 backdrop-blur-md p-8 rounded-xl shadow-md text-center max-w-md w-full ">
        {loading ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 border-4 border-[#BF9B53] border-t-transparent rounded-full animate-spin"></div>
            </div>

            <h2 className="text-lg font-semibold text-[#BF9B53]">
              Processing...
            </h2>

            <p className="text-sm text-[#BF9B53] mt-2">
              Please wait while we verify your login
            </p>
          </>
        ) : (
          <>
            <div className="text-[#BF9B53] text-4xl mb-3 flex justify-center ">
              <FaRegUser />
            </div>

            <h2 className="text-lg font-semibold text-red-600">
              Authentication Failed
            </h2>

            <p className="text-sm text-white mt-2">{message}</p>

            <div className="flex gap-3 justify-center mt-5">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-[#BF9B53] text-white rounded"
              >
                Go to Login
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Signup
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthErrorPage;
