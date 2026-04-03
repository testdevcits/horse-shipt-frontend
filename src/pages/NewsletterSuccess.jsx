import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NewsletterSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMessage, setShowMessage] = useState("");

  useEffect(() => {
    // token query param check
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (!token) {
      // token missing: show message and redirect after 3 sec
      setShowMessage("Invalid access. Redirecting to Home...");
      setTimeout(() => navigate("/"), 3000);
    } else {
      // valid token: show success message and redirect after 5 sec
      setShowMessage(
        "Email Verified! You will be redirected to Home shortly..."
      );
      setTimeout(() => navigate("/"), 5000);
    }
  }, [location, navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 text-center max-w-md">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Newsletter</h1>
        <p className="text-gray-700 mb-6">{showMessage}</p>
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

export default NewsletterSuccess;
