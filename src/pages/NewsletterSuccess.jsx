// pages/NewsletterVerificationPage.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNewsletter } from "../contexts/NewsletterContext";

const NewsletterVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verify } = useNewsletter(); // using verify method from context
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setMessage("Token missing.");
      setTimeout(() => navigate("/newsletter-error"), 2000);
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await verify(token); // call verify from context

        if (res.success) {
          setMessage("Email verified successfully!");
          setTimeout(() => navigate("/newsletter-success"), 2000);
        } else {
          // handle invalid or expired token
          setMessage(res.message || "Verification failed.");
          setTimeout(() => navigate("/newsletter-error"), 2000);
        }
      } catch (err) {
        setMessage("Something went wrong.");
        setTimeout(() => navigate("/newsletter-error"), 2000);
      }
    };

    verifyEmail();
  }, [location.search, navigate, verify]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
      <p className="text-lg font-semibold">{message}</p>
    </div>
  );
};

export default NewsletterVerificationPage;
