import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NewsletterError = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const msg = query.get("msg");

  const [errorMessage, setErrorMessage] = useState("Something went wrong.");

  useEffect(() => {
    // Dynamic message based on query
    if (msg === "token-missing") setErrorMessage("Token is missing.");
    else if (msg === "invalid-token") setErrorMessage("Invalid token.");
    else if (msg === "token-expired") setErrorMessage("Token has expired.");
    else if (msg === "server-error")
      setErrorMessage("Server error, please try again.");
    else setErrorMessage("Something went wrong.");

    // Auto redirect after 5 sec
    const timer = setTimeout(() => navigate("/"), 5000);

    return () => clearTimeout(timer);
  }, [msg, navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 text-center max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Verification Failed
        </h1>
        <p className="text-gray-700 mb-6">{errorMessage}</p>
        <a
          href="/"
          className="bg-[#BF9B53] text-white px-6 py-2 rounded font-semibold hover:bg-[#a67f46]"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
};

export default NewsletterError;
