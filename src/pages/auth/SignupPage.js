import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import signupBg from "../../assets/images/authPage.jpg";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../contexts/AuthContext";
import loginLogo from "../../assets/images/HorseShipt_White.svg";
import { FiArrowLeft, FiEye, FiEyeOff, FiRefreshCw } from "react-icons/fi";
import { API_BASE_URL } from "../../config/api";

const blockedEmailDomains = new Set([
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "mailinator.com",
  "guerrillamail.com",
  "throwawaymail.com",
  "trashmail.com",
  "dispostable.com",
  "maildrop.cc",
  "getnada.com",
]);

const isBlockedEmail = (email = "") => {
  const domain = email.trim().toLowerCase().split("@").pop();
  return blockedEmailDomains.has(domain);
};

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, verifySignupOtp, resendSignupOtp, oauthLogin, oauthError } =
    useAuth();

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const initialValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email")
      .required("Email is required")
      .test(
        "not-disposable-email",
        "Temporary or disposable email addresses are not allowed",
        (value) => !value || !isBlockedEmail(value)
      ),
    password: Yup.string()
      .min(8, "Minimum 8 characters")
      .matches(/[A-Z]/, "Must contain an uppercase letter")
      .matches(/[a-z]/, "Must contain a lowercase letter")
      .matches(/\d/, "Must contain a number")
      .matches(/[@$!%*?&]/, "Must contain a special character")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
    role: Yup.string()
      .oneOf(["shipper", "customer"], "Please select a role")
      .required("Please select a role"),
  });

  useEffect(() => {
    const fromRoute = location.state?.otpStep;
    const fromStorage = localStorage.getItem("pendingSignupOtp");

    if (fromRoute?.email && fromRoute?.role) {
      setOtpStep(fromRoute);
      if (location.state?.message) Toast.success(location.state.message);
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    if (fromStorage) {
      try {
        const parsed = JSON.parse(fromStorage);
        if (parsed?.email && parsed?.role) setOtpStep(parsed);
      } catch (error) {
        localStorage.removeItem("pendingSignupOtp");
      }
    }
  }, [location.pathname, location.state, navigate]);

  // ----------------- OAuth -----------------
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const error = params.get("error");
    if (error) {
      Toast.error(decodeURIComponent(error));
      navigate(location.pathname, { replace: true });
      return;
    }

    const token = params.get("token");
    if (token) {
      const userData = {
        _id: params.get("id"),
        role: params.get("role") || "customer",
        name: params.get("name"),
        email: params.get("email"),
        photo: params.get("photo") || "",
        provider: params.get("provider"),
        providerId: params.get("providerId"),
      };

      oauthLogin({ token, ...userData });

      navigate(
        userData.role === "shipper"
          ? "/shipper/dashboard"
          : "/customer/dashboard",
        { replace: true }
      );
    }

    if (oauthError) {
      Toast.error(oauthError);
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, oauthError, oauthLogin, navigate, location.pathname]);

  // ----------------- Signup -----------------
  const handleSignup = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);

    try {
      const res = await signup({ ...values, action: "signup" });

      if (res.success) {
        if (res.requiresOtp) {
          setOtp("");
          setOtpStep({
            email: res.data?.email || values.email,
            role: res.data?.role || values.role,
          });
          localStorage.setItem(
            "pendingSignupOtp",
            JSON.stringify({
              email: res.data?.email || values.email,
              role: res.data?.role || values.role,
            })
          );
          Toast.success(res.message || "OTP sent to your email");
          return;
        }

        Toast.success("Signup successful");

        resetForm();

        navigate(
          res.data.role === "shipper"
            ? "/shipper/dashboard"
            : "/customer/dashboard",
          { replace: true }
        );
      } else {
        Toast.error(res.errors?.join(", ") || "Signup failed");
      }
    } catch (err) {
      Toast.error(
        err.response?.data?.errors?.[0] ||
          err.response?.data?.message ||
          "Signup error"
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // ----------------- Google Signup -----------------
  const handleGoogleSignup = (role) => {
    if (!role) {
      Toast.error("Please select a role before Google signup.");
      return;
    }

    window.location.href = `${API_BASE_URL}/auth/google?role=${encodeURIComponent(
      role
    )}&intent=signup`;
  };

  const handleVerifyOtp = async () => {
    if (!otpStep) return;

    if (!/^\d{6}$/.test(otp.trim())) {
      Toast.error("Please enter the 6 digit OTP");
      return;
    }

    setOtpLoading(true);

    const res = await verifySignupOtp({
      email: otpStep.email,
      role: otpStep.role,
      otp: otp.trim(),
    });

    setOtpLoading(false);

    if (!res.success) {
      Toast.error(res.errors?.join(", ") || "Invalid OTP");
      return;
    }

    Toast.success(res.message || "Email verified successfully");
    localStorage.removeItem("pendingSignupOtp");
    navigate(
      res.data.role === "shipper" ? "/shipper/dashboard" : "/customer/dashboard",
      { replace: true }
    );
  };

  const handleResendOtp = async () => {
    if (!otpStep) return;

    setResendLoading(true);

    const res = await resendSignupOtp({
      email: otpStep.email,
      role: otpStep.role,
    });

    setResendLoading(false);

    if (!res.success) {
      Toast.error(res.errors?.join(", ") || "Failed to resend OTP");
      return;
    }

    setOtp("");
    Toast.success(res.message || "OTP resent to your email");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center font-montserrat p-4"
      style={{ backgroundImage: `url(${signupBg})` }}
    >
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl gap-20">
        {/* Logo */}
        <div className="flex items-center justify-center w-full md:w-[1168px] h-[64px] gap-4 opacity-100">
          <img src={loginLogo} alt="Logo" className="h-full object-contain" />
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-md flex flex-col justify-center w-full max-w-sm gap-4">
          {otpStep ? (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => {
                  setOtpStep(null);
                  setOtp("");
                }}
                className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-[#BF9B53]"
              >
                <FiArrowLeft size={14} /> Edit signup details
              </button>

              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  Verify Email
                </h1>
                <p className="mt-1 text-xs text-gray-600">
                  Enter the OTP sent to{" "}
                  <span className="font-semibold text-gray-800">
                    {otpStep.email}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">
                  6 Digit OTP
                </label>
                <input
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  placeholder="Enter OTP"
                  className="w-full border rounded p-2 text-center text-lg tracking-[0.35em] mt-1"
                />
              </div>

              <Button
                type="button"
                disabled={otpLoading || otp.length !== 6}
                onClick={handleVerifyOtp}
              >
                {otpLoading ? "Verifying..." : "Verify & Create Account"}
              </Button>

              <button
                type="button"
                disabled={resendLoading}
                onClick={handleResendOtp}
                className="flex items-center justify-center gap-2 text-xs font-semibold text-[#BF9B53] disabled:opacity-60"
              >
                <FiRefreshCw
                  size={14}
                  className={resendLoading ? "animate-spin" : ""}
                />
                {resendLoading ? "Sending OTP..." : "Resend OTP"}
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                Create Account
              </h1>

              <p className="text-xs text-gray-600">
                Already have an account?{" "}
                <span
                  className="text-[#BF9B53] font-medium cursor-pointer hover:underline"
                  onClick={() => navigate("/login")}
                >
                  Login
                </span>
              </p>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSignup}
                validateOnMount
              >
                {({ values, setFieldValue, isValid, isSubmitting }) => {
                  const canSubmit =
                    isValid && values.role && !isSubmitting && !loading;

                  return (
                    <Form className="flex flex-col gap-3">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-medium text-gray-700">
                      Name
                    </label>
                    <Field
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      className="w-full border rounded p-2 text-xs mt-1"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-medium text-gray-700">
                      Email
                    </label>
                    <Field
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="w-full border rounded p-2 text-xs mt-1"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-xs font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        name="password"
                        type={showPassword.password ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full border rounded p-2 text-xs mt-1 pr-8"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            password: !prev.password,
                          }))
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword.password ? (
                          <FiEyeOff size={16} />
                        ) : (
                          <FiEye size={16} />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-xs font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Field
                        name="confirmPassword"
                        type={
                          showPassword.confirmPassword ? "text" : "password"
                        }
                        placeholder="Confirm your password"
                        className="w-full border rounded p-2 text-xs mt-1 pr-8"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            confirmPassword: !prev.confirmPassword,
                          }))
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword.confirmPassword ? (
                          <FiEyeOff size={16} />
                        ) : (
                          <FiEye size={16} />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="confirmPassword"
                      component="div"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* Role */}
                  <p className="text-xs font-medium text-gray-700 mt-1">
                    Select your role:
                  </p>

                  <div className="flex gap-2">
                    {["shipper", "customer"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`flex-1 py-1 text-xs font-medium  ${
                          values.role === r
                            ? "bg-[#BF9B53] text-white"
                            : "bg-gray-200 text-gray-700 border border-gray-500"
                        }`}
                        onClick={() => setFieldValue("role", r)}
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>

                  <ErrorMessage
                    name="role"
                    component="div"
                    className="text-xs text-red-500"
                  />

                  {/* Submit */}
                  <Button type="submit" disabled={!canSubmit}>
                    {loading ? "Signing up..." : "Signup"}
                  </Button>

                  {/* Google */}
                  <Button
                    type="button"
                    disabled={!values.role}
                    onClick={() => handleGoogleSignup(values.role)}
                    className="flex items-center justify-center gap-2 border border-gray-300 text-black rounded-full text-xs py-1.5"
                  >
                    <FcGoogle size={16} /> Continue with Google
                  </Button>
                    </Form>
                  );
                }}
              </Formik>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
