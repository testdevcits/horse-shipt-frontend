import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import signupBg from "../../assets/images/authPage.jpg";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [toast, setToast] = useState(null);
  const [selectedRole, setSelectedRole] = useState("shipper");

  const initialValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "shipper",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(6, "Minimum 6 characters").required("Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Required"),
    role: Yup.string().oneOf(["shipper", "customer"]).required("Required"),
  });

  // Handle OAuth errors from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (error) setToast({ message: decodeURIComponent(error), type: "error" });
  }, [location.search]);

  // ---------------- Regular Signup ----------------
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        name: values.name,
        email: values.email,
        password: values.password,
        role: selectedRole,
      });

      const data = response.data;
      if (data.success) {
        const user = data.data;

        const authUser = {
          _id: user._id,
          role: user.role,
          name: user.name || "",
          email: user.email || "",
          photo: user.profilePicture || "",
          provider: user.provider || "",
          providerId: user.providerId || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          locale: user.locale || "",
          isLogin: user.isLogin,
          isActive: user.isActive,
        };

        const authData = {
          authToken: user.token,
          authUser,
          token: user.token,
          tokenExpiry: Date.now() + 3600 * 1000, // 1 hour
        };

        localStorage.setItem("authData", JSON.stringify(authData));
        login(authUser, user.token, 3600);

        setToast({ message: "Signup successful!", type: "info" });
        resetForm();

        navigate(
          user.role === "shipper" ? "/shipper/dashboard" : "/customer/dashboard"
        );
      } else {
        setToast({ message: data.message || "Signup failed", type: "error" });
      }
    } catch (error) {
      console.error(error);
      setToast({
        message:
          error.response?.data?.errors?.[0] ||
          error.response?.data?.message ||
          "Signup error",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- Google OAuth ----------------
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google?role=${selectedRole}`;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center font-montserrat p-4"
      style={{ backgroundImage: `url(${signupBg})` }}
    >
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl gap-20">
        {/* Left: Logo */}
        <div className="flex items-center justify-center w-full md:w-[450px] h-[150px]">
          <svg width="120" height="120" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="#E5E7EB" />
            <path d="M32 16L40 32H24L32 16Z" fill="#1E40AF" />
            <circle cx="32" cy="42" r="4" fill="#1E40AF" />
          </svg>
        </div>

        {/* Right: Signup Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-md flex flex-col justify-center w-full max-w-sm gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-start text-gray-800">
            Create Account
          </h1>

          <p className="text-xs text-gray-600">
            Already have an account?{" "}
            <span
              className="text-[#BF9B53] font-medium cursor-pointer px-2 py-1 rounded hover:underline"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, isValid, dirty, isSubmitting }) => (
              <Form className="flex flex-col gap-3">
                <InputField
                  label="Name"
                  type="text"
                  placeholder="Enter your name"
                  value={values.name}
                  onChange={(e) => setFieldValue("name", e.target.value)}
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-xs text-red-500"
                />

                <InputField
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={values.email}
                  onChange={(e) => setFieldValue("email", e.target.value)}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-xs text-red-500"
                />

                <InputField
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={(e) => setFieldValue("password", e.target.value)}
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-xs text-red-500"
                />

                <InputField
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  value={values.confirmPassword}
                  onChange={(e) =>
                    setFieldValue("confirmPassword", e.target.value)
                  }
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-xs text-red-500"
                />

                {/* Role selection */}
                <div className="flex gap-2">
                  {["shipper", "customer"].map((r) => (
                    <button
                      type="button"
                      key={r}
                      className={`flex-1 py-1 text-xs font-medium rounded ${
                        selectedRole === r
                          ? "bg-[#BF9B53] text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => setSelectedRole(r)}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Submit button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!(isValid && dirty) || isSubmitting}
                    className={`px-4 py-1.5 text-xs rounded-md ${
                      isValid && dirty
                        ? "bg-[#BF9B53] text-white hover:bg-[#a6813f]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Signup
                  </Button>
                </div>

                {/* Google OAuth Button */}
                <div className="flex flex-col gap-2 mt-4">
                  <Button
                    className="w-full flex items-center justify-center border border-gray-300 bg-white text-black hover:bg-gray-100 gap-2 rounded-full text-xs py-1.5"
                    onClick={handleGoogleLogin}
                  >
                    <FcGoogle size={16} /> Continue with Google
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* Toast */}
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
