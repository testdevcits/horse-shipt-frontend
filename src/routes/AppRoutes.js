import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// ---------------- Auth Pages ----------------
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const SignupPage = lazy(() => import("../pages/auth/SignupPage"));
const OAuthSuccessPage = lazy(() => import("../pages/auth/OAuthSuccessPage")); // NEW

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
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen text-gray-700">
          Loading...
        </div>
      }
    >
      <Routes>
        {/* ---------------- Auth Routes ---------------- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />

        {/* ---------------- Shipper Routes ---------------- */}
        <Route
          path="/shipper"
          element={
            <ProtectedRoute role="shipper">
              <ShipperLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<ShipperDashboard />} />
          <Route path="orders" element={<ShipperOrders />} />
          <Route path="profile" element={<ShipperProfile />} />
          <Route path="settings" element={<ShipperSettings />} />
        </Route>

        {/* ---------------- Customer Routes ---------------- */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute role="customer">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="settings" element={<CustomerSettings />} />
        </Route>

        {/* ---------------- Fallback 404 ---------------- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
