import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import loginBg from "../../assets/images/authPage.jpg";
import { FcGoogle } from "react-icons/fc";
import loginLogo from "../../assets/images/loginLogo.png";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

const LoginPage = () => {
  const { login, oauthLogin, setUser, setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

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
    const error = params.get("error");
    if (error) {
      setToast({ message: decodeURIComponent(error), type: "error" });
      return;
    }

    const token = params.get("token");
    if (token) {
      const role = params.get("role") || "customer";
      const userData = {
        _id: params.get("_id"),
        name: params.get("name"),
        email: params.get("email"),
        profilePicture: params.get("photo") || "",
        role,
        provider: params.get("provider"),
        providerId: params.get("providerId"),
        isLogin: true,
        token,
      };

      // Update AuthContext and localStorage
      setUser(userData);
      setToken(token);
      localStorage.setItem("horseShiptUser", JSON.stringify(userData));
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userData._id || "");

      navigate(
        role === "shipper" ? "/shipper/dashboard" : "/customer/dashboard",
        { replace: true }
      );
    }
  }, [location.search, navigate, setUser, setToken]);

  // ----------------- Handle normal login -----------------
  const handleLogin = async (values, { setSubmitting, setFieldError }) => {
    setLoading(true);

    try {
      const result = await login(values);

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
    )}`;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center font-montserrat p-4"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl gap-20">
        {/* Logo */}
        <div className="flex items-center justify-center w-full md:w-[1168px] h-[64px] gap-4 opacity-100">
          <img src={loginLogo} alt="Logo" className="h-full object-contain" />
        </div>

        {/* Login form */}
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
                    <Field
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      className="w-full border rounded p-2 text-xs mt-1"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* Role selection */}
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

                  {/* Submit button */}
                  <div className="flex justify-end mt-2">
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      className={`px-4 py-1.5 text-xs rounded-md ${
                        canSubmit
                          ? "bg-[#BF9B53] text-white hover:bg-[#a6813f]"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </div>

                  {/* Google login */}
                  <div className="flex flex-col gap-2 mt-3">
                    <Button
                      type="button"
                      className="w-full flex items-center justify-center border border-gray-300 text-black gap-2 rounded-full text-xs py-1.5"
                      onClick={() => handleGoogleLogin(values.role)}
                      disabled={!values.role}
                    >
                      <FcGoogle size={16} /> Continue with Google
                    </Button>
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
