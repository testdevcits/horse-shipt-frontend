import React, { useMemo, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import loginBg from "../../assets/images/authPage.jpg";
import loginLogo from "../../assets/images/HorseShipt_White.svg";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

const roleLabels = {
  shipper: "Shipper",
  customer: "Customer",
  driver: "Driver",
};

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border rounded p-2 pr-9 text-xs mt-1"
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
        aria-label={visible ? "Hide password" : "Show password"}
        title={visible ? "Hide password" : "Show password"}
      >
        {visible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
      </button>
    </div>
  );
};

const OtpInput = ({ value, onChange }) => {
  const refs = React.useRef([]);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");

  const setDigit = (index, digit) => {
    const next = digits.map((item) => (item === " " ? "" : item));
    next[index] = digit;
    onChange(next.join("").replace(/\D/g, "").slice(0, 6));
  };

  const handleChange = (index, event) => {
    const raw = event.target.value.replace(/\D/g, "");
    if (!raw) {
      setDigit(index, "");
      return;
    }

    if (raw.length > 1) {
      onChange(raw.slice(0, 6));
      refs.current[Math.min(raw.length, 5)]?.focus();
      return;
    }

    setDigit(index, raw);
    if (index < 5) refs.current[index + 1]?.focus();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      event.preventDefault();
      setDigit(index - 1, "");
      refs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  };

  return (
    <div className="grid grid-cols-6 gap-2" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => (refs.current[index] = element)}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit === " " ? "" : digit}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => event.target.select()}
          aria-label={`OTP digit ${index + 1}`}
          className="h-10 min-w-0 rounded-md border border-gray-300 bg-white text-center text-base font-semibold text-gray-900 outline-none transition focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20"
        />
      ))}
    </div>
  );
};

const ForgotPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialRole = useMemo(() => {
    const queryRole = new URLSearchParams(location.search).get("role");
    return roleLabels[queryRole] ? queryRole : "shipper";
  }, [location.search]);

  const [step, setStep] = useState("email");
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const setNotice = (type, text) => setMessage({ type, text });

  const sendOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email,
        role,
      });
      setStep("otp");
      setNotice("success", "OTP sent to your registered email.");
    } catch (error) {
      setNotice(
        "error",
        error.response?.data?.message || "Failed to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await axios.post(`${API_BASE_URL}/auth/verify-reset-otp`, {
        email,
        role,
        otp,
      });
      setVerifiedOtp(otp);
      setStep("reset");
      setNotice("success", "OTP verified. Please enter your new password.");
    } catch (error) {
      setNotice("error", error.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (!verifiedOtp) {
      setNotice("error", "Please verify OTP before resetting password.");
      setStep("otp");
      return;
    }

    if (newPassword.length < 6) {
      setNotice("error", "Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setNotice("error", "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        email,
        role,
        otp: verifiedOtp,
        newPassword,
      });
      setNotice("success", "Password reset successfully. Please login.");
      setTimeout(() => {
        navigate(role === "driver" ? "/driver/login" : "/login", {
          replace: true,
        });
      }, 1200);
    } catch (error) {
      setNotice(
        "error",
        error.response?.data?.message || "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center font-montserrat p-4"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl gap-20">
        <div className="flex items-center justify-center w-full md:w-[1168px] h-[64px] gap-4 opacity-100">
          <img src={loginLogo} alt="Logo" className="h-full object-contain" />
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-md flex flex-col justify-center w-full max-w-sm gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {step === "email"
              ? "Forgot Password"
              : step === "otp"
              ? "Verify OTP"
              : "Reset Password"}
          </h1>

          {message && (
            <div
              className={`text-xs rounded p-2 ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {step === "email" && (
            <form onSubmit={sendOtp} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700">
                  Account Type
                </label>
                <div className="flex gap-2 mt-1">
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={`flex-1 py-1 text-xs font-medium rounded ${
                        role === value
                          ? "bg-[#BF9B53] text-white"
                          : "bg-gray-200 text-gray-700 border border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter registered email"
                  className="w-full border rounded p-2 text-xs mt-1"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full px-4 py-2 text-sm rounded-lg bg-[#BF9B53] text-white hover:bg-[#a6813f] disabled:bg-gray-300 disabled:text-gray-500"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={verifyOtp} className="flex flex-col gap-3">
              <p className="text-xs text-gray-600">
                Enter the 6-digit code sent to {email}.
              </p>
              <OtpInput value={otp} onChange={setOtp} />
              <p className="text-[11px] font-medium text-gray-500">
                {otp.length}/6 digits entered
              </p>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full px-4 py-2 text-sm rounded-lg bg-[#BF9B53] text-white hover:bg-[#a6813f] disabled:bg-gray-300 disabled:text-gray-500"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={resetPassword} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700">
                  New Password
                </label>
                <PasswordInput
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">
                  Confirm Password
                </label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full px-4 py-2 text-sm rounded-lg bg-[#BF9B53] text-white hover:bg-[#a6813f] disabled:bg-gray-300 disabled:text-gray-500"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="text-right">
            <Link
              to={role === "driver" ? "/driver/login" : "/login"}
              className="text-sm text-[#BF9B53] hover:text-black"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
