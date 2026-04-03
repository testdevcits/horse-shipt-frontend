// pages/NewsletterVerificationPage.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNewsletter } from "../contexts/NewsletterContext";

const NewsletterVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscribe } = useNewsletter(); // Use the context
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setMessage("Token missing.");
      setTimeout(() => navigate("/newsletter-error"), 2000);
      return;
    }

    // Call the newsletter subscribe/verify function from context
    const verifyEmail = async () => {
      try {
        // Using your context's subscribe method as an example
        // If you have a dedicated verify API, you can add it to the context
        const res = await subscribe(token); // pass token as email for now (or modify context)

        // Check if the response contains success
        if (res?.success || res?.status === "success") {
          setMessage("Email verified successfully!");
          setTimeout(() => navigate("/newsletter-success"), 2000);
        } else {
          setMessage(res?.message || "Verification failed.");
          setTimeout(() => navigate("/newsletter-error"), 2000);
        }
      } catch (err) {
        setMessage("Something went wrong.");
        setTimeout(() => navigate("/newsletter-error"), 2000);
      }
    };

    verifyEmail();
  }, [location.search, navigate, subscribe]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
      <p className="text-lg font-semibold">{message}</p>
    </div>
  );
};

export default NewsletterVerificationPage;
