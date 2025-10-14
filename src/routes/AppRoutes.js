import React, { lazy, Suspense, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RedirectIfAuth from "../pages/auth/RedirectIfAuth";
import { useAuth } from "../contexts/AuthContext";

// ---------------- Auth Pages ----------------
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const SignupPage = lazy(() => import("../pages/auth/SignupPage"));
const OAuthSuccessPage = lazy(() => import("../pages/auth/OAuthSuccessPage"));

// ---------------- Shipper Pages ----------------
const ShipperLayout = lazy(() => import("../layouts/ShipperLayout"));
const ShipperDashboard = lazy(() => import("../pages/shipper/Dashboard"));
const ShipperOrders = lazy(() => import("../pages/shipper/Orders"));
const ShipperProfile = lazy(() => import("../pages/shipper/Profile"));
const ShipperSettings = lazy(() => import("../pages/shipper/Settings"));

// ---------------- Customer Pages ----------------
const CustomerLayout = lazy(() => import("../layouts/CustomerLayout"));
const CustomerDashboard = lazy(() => import("../pages/customer/CustDashboard"));
const CustomerOrders = lazy(() => import("../pages/customer/Orders"));
const CustomerProfile = lazy(() => import("../pages/customer/Profile"));
const CustomerSettings = lazy(() => import("../pages/customer/Settings"));

// ---------------- 404 Page ----------------
const NotFoundPage = lazy(() => import("../pages/NotFound"));

const AppRoutes = () => {
  const { login, oauthLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/oauth-success") {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      const role = params.get("role");
      const email = params.get("email");
      const name = params.get("name");
      const photo = params.get("photo");
      const provider = params.get("provider");
      const providerId = params.get("providerId");

      if (token && role) {
        // ----------------- Use oauthLogin instead of normal login -----------------
        oauthLogin({
          token,
          role,
          provider,
          providerId,
          email,
          name,
          photo,
        });

        // Redirect to dashboard
        navigate(`/${role}/dashboard`, { replace: true });
      }
    }
  }, [location.pathname, location.search, oauthLogin, navigate]);

  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
          <p className="mt-3 text-sm">Loading, please wait...</p>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <LoginPage />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuth>
              <SignupPage />
            </RedirectIfAuth>
          }
        />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />

        {/* Shipper Routes */}
        <Route
          path="/shipper/*"
          element={
            <ProtectedRoute role="shipper">
              <ShipperLayout key="shipper" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ShipperDashboard />} />
          <Route path="orders" element={<ShipperOrders />} />
          <Route path="profile" element={<ShipperProfile />} />
          <Route path="settings" element={<ShipperSettings />} />
        </Route>

        {/* Customer Routes */}
        <Route
          path="/customer/*"
          element={
            <ProtectedRoute role="customer">
              <CustomerLayout key="customer" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="settings" element={<CustomerSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
