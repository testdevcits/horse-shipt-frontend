import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "../../components/common/Button";
import InputField from "../../components/common/InputField";
import Toast from "../../components/common/Toast";
import loginBg from "../../assets/images/authPage.jpg";
import { FcGoogle } from "react-icons/fc";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

const LoginPage = () => {
  const { login, oauthLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const initialValues = { email: "", password: "", role: "shipper" };
  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().required("Required"),
    role: Yup.string().oneOf(["shipper", "customer"]).required("Required"),
  });

  // ----------------- OAuth redirect handling -----------------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (error) setToast({ message: decodeURIComponent(error), type: "error" });

    const token = params.get("token");
    if (token) {
      const oauthUser = {
        _id: params.get("id"),
        role: params.get("role"),
        name: params.get("name"),
        email: params.get("email"),
        photo: params.get("photo") || "",
        provider: params.get("provider"),
        providerId: params.get("providerId"),
        firstName: params.get("firstName") || "",
        lastName: params.get("lastName") || "",
        locale: params.get("locale") || "",
      };
      oauthLogin({ token, ...oauthUser });
      navigate(
        oauthUser.role === "shipper"
          ? "/shipper/dashboard"
          : "/customer/dashboard"
      );
    }
  }, [location.search, oauthLogin, navigate]);

  // ----------------- Handle normal login -----------------
  const handleLogin = async (values, { setSubmitting }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (data.success) {
        const user = data.data;
        login(user); // Update AuthContext
        setToast({ message: "Logged in successfully!", type: "info" });
        navigate(
          user.role === "shipper" ? "/shipper/dashboard" : "/customer/dashboard"
        );
      } else {
        setToast({
          message: data.errors?.[0] || "Login failed",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Login Error:", err);
      setToast({ message: "Login error", type: "error" });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  // ----------------- Google OAuth login -----------------
  const handleGoogleLogin = (role) => {
    window.location.href = `${API_BASE_URL}/auth/google?role=${role}`;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center font-montserrat p-4"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl gap-20">
        <div className="flex items-center justify-center w-full md:w-[450px] h-[150px]">
          <svg width="120" height="120" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="#E5E7EB" />
            <path d="M32 16L40 32H24L32 16Z" fill="#1E40AF" />
            <circle cx="32" cy="42" r="4" fill="#1E40AF" />
          </svg>
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
          >
            {({ values, setFieldValue, isValid, dirty, isSubmitting }) => (
              <Form className="flex flex-col gap-3">
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

                <div className="flex gap-2">
                  {["shipper", "customer"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`flex-1 py-1 text-xs font-medium rounded ${
                        values.role === r
                          ? "bg-[#BF9B53] text-white"
                          : "bg-gray-200 text-gray-700"
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

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!(isValid && dirty) || isSubmitting || loading}
                    className={`px-4 py-1.5 text-xs rounded-md ${
                      isValid && dirty
                        ? "bg-[#BF9B53] text-white hover:bg-[#a6813f]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <Button
                    className="w-full flex items-center justify-center border border-gray-300 text-black gap-2 rounded-full text-xs py-1.5"
                    onClick={() => handleGoogleLogin(values.role)}
                  >
                    <FcGoogle size={16} /> Continue with Google
                  </Button>
                </div>
              </Form>
            )}
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
