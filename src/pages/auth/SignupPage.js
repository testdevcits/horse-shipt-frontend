import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import signupBg from "../../assets/images/authPage.jpg";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, oauthLogin } = useAuth();

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const initialValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
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

  // Handle redirect from OAuth
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (error) setToast({ message: decodeURIComponent(error), type: "error" });

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
          : "/customer/dashboard"
      );
    }
  }, [location.search, oauthLogin, navigate]);

  const handleSignup = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/signup`, {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role, // send role to backend
        provider: "local",
      });

      const data = res.data;
      if (data.success) {
        const user = data.data;
        login(
          {
            _id: user._id,
            role: user.role,
            name: user.name || "",
            email: user.email || "",
          },
          user.token,
          3600
        );
        setToast({ message: "Signup successful!", type: "info" });
        resetForm();
        navigate(
          user.role === "shipper" ? "/shipper/dashboard" : "/customer/dashboard"
        );
      } else {
        setToast({
          message: data.errors?.[0] || data.message || "Signup failed",
          type: "error",
        });
      }
    } catch (err) {
      setToast({
        message:
          err.response?.data?.message ||
          err.response?.data?.errors?.[0] ||
          "Signup error",
        type: "error",
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = (role) => {
    if (!role) {
      setToast({
        message: "Please select a role before Google signup.",
        type: "error",
      });
      return;
    }
    // Send role as query param
    window.location.href = `${API_BASE_URL}/auth/google?role=${encodeURIComponent(
      role
    )}`;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center font-montserrat p-4"
      style={{ backgroundImage: `url(${signupBg})` }}
    >
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl gap-20">
        {/* Logo */}
        <div className="flex items-center justify-center w-full md:w-[450px] h-[150px]">
          <svg width="120" height="120" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="#E5E7EB" />
            <path d="M32 16L40 32H24L32 16Z" fill="#1E40AF" />
            <circle cx="32" cy="42" r="4" fill="#1E40AF" />
          </svg>
        </div>

        {/* Signup form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-md flex flex-col justify-center w-full max-w-sm gap-4">
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
            validateOnChange
            validateOnBlur
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
                    <Field
                      name="password"
                      type="password"
                      placeholder="Enter password"
                      className="w-full border rounded p-2 text-xs mt-1"
                    />
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
                    <Field
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      className="w-full border rounded p-2 text-xs mt-1"
                    />
                    <ErrorMessage
                      name="confirmPassword"
                      component="div"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* Role selection */}
                  <p className="text-xs font-medium text-gray-700 mt-1">
                    Are you a Customer or Shipper? Please select your role:
                  </p>
                  <div className="flex gap-2">
                    {["shipper", "customer"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFieldValue("role", r, true)}
                        className={`flex-1 py-1 text-xs font-medium rounded transition-all duration-150 ${
                          values.role === r
                            ? "bg-[#BF9B53] text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
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
                    <Button type="submit" disabled={!canSubmit}>
                      {loading ? "Signing up..." : "Signup"}
                    </Button>
                  </div>

                  {/* Google signup */}
                  <div className="flex flex-col gap-2 mt-4">
                    <Button
                      type="button"
                      fullWidth
                      disabled={!values.role}
                      onClick={() => handleGoogleSignup(values.role)}
                      className="flex items-center justify-center border border-gray-300 text-black gap-2 rounded-full text-xs py-1.5"
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

export default SignupPage;
