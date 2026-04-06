import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import loginBg from "../../assets/images/authPage.jpg";
import { FcGoogle } from "react-icons/fc";
import loginLogo from "../../assets/images/loginLogo.png";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

const EyeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const LoginPage = () => {
  const { login, oauthLogin, oauthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = { email: "", password: "", role: "" };
  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().required("Required"),
    role: Yup.string()
      .oneOf(["shipper", "customer"], "Select a role")
      .required("Required"),
  });

  // ----------------- Handle OAuth redirect -----------------
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // ---------------- Frontend toast for backend error ----------------
    const error = params.get("error");
    if (error) {
      setToast({ message: decodeURIComponent(error), type: "error" });
      // Clean URL so toast doesn't repeat
      navigate(location.pathname, { replace: true });
      return;
    }

    // ---------------- Frontend OAuth login ----------------
    const token = params.get("token");
    if (token) {
      const oauthUser = {
        _id: params.get("id"),
        role: params.get("role") || "customer",
        name: params.get("name"),
        email: params.get("email"),
        photo: params.get("photo") || "",
        provider: params.get("provider"),
        providerId: params.get("providerId"),
      };

      oauthLogin({ token, ...oauthUser });

      navigate(
        oauthUser.role === "shipper"
          ? "/shipper/dashboard"
          : "/customer/dashboard",
        { replace: true }
      );
    }

    // ---------------- Handle any local oauthError from context ----------------
    if (oauthError) {
      setToast({ message: oauthError, type: "error" });
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, oauthError, oauthLogin, navigate, location.pathname]);

  // ----------------- Handle normal login -----------------
  const handleLogin = async (values, { setSubmitting, setFieldError }) => {
    setLoading(true);
    try {
      const result = await login({ ...values, action: "login" });

      if (result.success) {
        navigate(
          values.role === "shipper"
            ? "/shipper/dashboard"
            : "/customer/dashboard",
          { replace: true }
        );
      } else {
        if (result.errors?.length > 0) {
          const emailError = result.errors.find((e) =>
            e.toLowerCase().includes("email")
          );
          if (emailError) setFieldError("email", emailError);
          setToast({ message: result.errors.join(", "), type: "error" });
        } else {
          setToast({ message: "Login failed", type: "error" });
        }
      }
    } catch (err) {
      console.error("[LOGIN FRONTEND ERROR]", err);
      setToast({ message: "Login error", type: "error" });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  // ----------------- Google OAuth login -----------------
  const handleGoogleLogin = (role) => {
    if (!role) {
      setToast({
        message: "Please select a role before Google login",
        type: "error",
      });
      return;
    }
    window.location.href = `${API_BASE_URL}/auth/google?role=${encodeURIComponent(
      role
    )}&action=login`;
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
          <h1 className="text-xl sm:text-2xl font-semibold text-start text-gray-800">
            Welcome Back
          </h1>
          <p className="text-xs text-gray-600">
            Don't have an account?{" "}
            <span
              className="text-[#BF9B53] font-medium cursor-pointer px-2 py-1 rounded hover:bg-[#bf9b5360] hover:text-black"
              onClick={() => navigate("/signup")}
            >
              Create an account
            </span>
          </p>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
            validateOnMount
          >
            {({ values, setFieldValue, isValid, isSubmitting, dirty }) => {
              const canSubmit =
                isValid && dirty && values.role && !isSubmitting && !loading;
              return (
                <Form className="flex flex-col gap-3">
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

                  <div>
                    <label className="text-xs font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative mt-1">
                      <Field
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full border rounded p-2 text-xs pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-xs text-red-500"
                    />
                  </div>

                  <p className="text-xs font-medium text-gray-700 mt-1">
                    Select your role:
                  </p>
                  <div className="flex gap-2">
                    {["shipper", "customer"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`flex-1 py-1 text-xs font-medium rounded ${
                          values.role === r
                            ? "bg-[#BF9B53] text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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

                  <div className="flex flex-col gap-3 mt-4">
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      className={`w-full px-4 py-2 text-sm rounded-lg transition ${
                        canSubmit
                          ? "bg-[#BF9B53] text-white hover:bg-[#a6813f]"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {loading ? "Logging in..." : "Login"}
                    </Button>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-gray-300" />
                      <span className="text-xs text-gray-500 font-medium">
                        OR
                      </span>
                      <div className="flex-1 h-px bg-gray-300" />
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleGoogleLogin(values.role)}
                      disabled={!values.role}
                      className="w-full flex items-center bg-gray-500 justify-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-300 transition disabled:opacity-50"
                    >
                      <FcGoogle size={18} /> Continue with Google
                    </Button>
                  </div>

                  <div className="mt-2 w-full text-end">
                    <Link
                      to="/"
                      className="text-[#BF9B53] cursor-pointer hover:text-black"
                    >
                      Back to Home
                    </Link>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default LoginPage;
