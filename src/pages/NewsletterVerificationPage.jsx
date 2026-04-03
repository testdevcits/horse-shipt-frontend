// pages/NewsletterVerificationPage.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNewsletter } from "../contexts/NewsletterContext";

const NewsletterVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verify } = useNewsletter();
  const [message, setMessage] = useState("Verifying...");
  const [showPopup] = useState(true);
  const [status, setStatus] = useState("info");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token missing.");
      setTimeout(() => navigate("/"), 3000);
      return;
    }

    const verifyEmail = async () => {
      try {
        console.log("[DEBUG] Verifying token:", token);
        const res = await verify(token);
        console.log("[DEBUG] Verify API response:", res);

        if (res.success) {
          setStatus("success");
          setMessage("✅ Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(`❌ ${res.message || "Verification failed."}`);
        }

        // show popup for 3 seconds then redirect
        setTimeout(() => navigate("/"), 3000);
      } catch (err) {
        console.error("[ERROR] Verification failed:", err);
        setStatus("error");
        setMessage("❌ Something went wrong.");
        setTimeout(() => navigate("/"), 3000);
      }
    };

    verifyEmail();
  }, [location.search, navigate, verify]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      {showPopup && (
        <div
          className={`max-w-sm w-full bg-white rounded-lg shadow-lg p-6 text-center
            ${status === "success" ? "border-l-4 border-green-500" : ""}
            ${status === "error" ? "border-l-4 border-red-500" : ""}
            ${status === "info" ? "border-l-4 border-blue-500" : ""}
          `}
        >
          <p className="text-lg font-semibold">{message}</p>
          <p className="text-sm text-gray-500 mt-2">
            Redirecting to homepage...
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsletterVerificationPage;
