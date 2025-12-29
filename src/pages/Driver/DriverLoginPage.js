import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDriverAuth } from "../../contexts/DriverAuthContext";
import Button from "../../components/common/Button";
import loginBg from "../../assets/images/authPage.jpg"; // background image

const DriverLoginPage = () => {
  const { login, loading } = useDriverAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    const res = await login(email, password);

    if (!res.success) {
      setError(res.message || "Login failed. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center font-montserrat p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-lg p-8 md:p-12 shadow-md flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 text-center">
          Driver Login
        </h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm w-full text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your password"
              required
            />
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            className="mt-2 flex justify-center items-center"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>{" "}
        {/* Back to Home Link */}
        <div className="mt-4 w-full text-end">
          <Link
            to="/"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DriverLoginPage;
