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
import MainLayout from "../layouts/MainLayout";
import NotificationsPage from "../pages/shipper/NotificationsPage";
import TruckDriverPage from "../pages/shipper/TruckDriverPage";

import NewsletterSuccess from "../pages/NewsletterSuccess";
import NewsletterError from "../pages/NewsletterError";

// ---------------- Driver Auth ----------------
import { DriverAuthProvider } from "../contexts/DriverAuthContext";
import ProtectedDriverRoute from "./ProtectedDriverRoute";
import CustomerChatOverview from "../pages/customer/ChatOverview";
import ShipperQuotesPage from "../pages/shipper/ShipperQuotesPage";
import MyHorses from "../pages/customer/MyHorses";
import GoogleReview from "../pages/shipper/GoogleReview";
import CustomerShipperReviewPage from "../pages/customer/CustomerShipperReviewPage";
import InviteShipmentPage from "../pages/InviteShipmentPage";
import NewsletterVerificationPage from "../pages/NewsletterVerificationPage";
import OAuthErrorPage from "../pages/auth/OAuthErrorPage";
import TrackShipmentPage from "../pages/TrackShipmentPage";
import AllShipments from "../pages/shipper/AllShipments";
import InvitedShipments from "../pages/shipper/InvitedShipments";

// ---------------- Auth Pages ----------------
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const SignupPage = lazy(() => import("../pages/auth/SignupPage"));
const OAuthSuccessPage = lazy(() => import("../pages/auth/OAuthSuccessPage"));
const PrivacyPage = lazy(() => import("../pages/PrivacyPage"));
const TermsPage = lazy(() => import("../pages/TermsPage"));

// ---------------- Shipper Pages ----------------
const ShipperLayout = lazy(() => import("../layouts/ShipperLayout"));
const ShipperDashboard = lazy(() => import("../pages/shipper/Dashboard"));
const ShipperContract = lazy(() => import("../pages/shipper/Contract"));
const ShipperProfile = lazy(() => import("../pages/shipper/Profile"));
const ShipperSettings = lazy(() => import("../pages/shipper/Settings"));
const ShipmentDetails = lazy(() => import("../pages/shipper/ShipmentDetails"));
const ShipperEarnings = lazy(() => import("../pages/shipper/PayoutHistory"));
const AllUpcomingShipments = lazy(() =>
  import("../pages/shipper/AllUpcomingShipments")
);
const ChatOverview = lazy(() => import("../pages/shipper/ChatOverview"));
const ShipmentSettings = lazy(() =>
  import("../pages/shipper/ShipmentSettings")
);
const VehiclesAndCapacity = lazy(() =>
  import("../pages/shipper/VehiclesAndCapacity")
);

// ---------------- Customer Pages ----------------
const CustomerLayout = lazy(() => import("../layouts/CustomerLayout"));
const CustomerDashboard = lazy(() => import("../pages/customer/CustDashboard"));
const CustomerOrders = lazy(() => import("../pages/customer/Orders"));
const CustomerProfile = lazy(() => import("../pages/customer/Profile"));
const CustomerSettings = lazy(() => import("../pages/customer/Settings"));
const NewShipment = lazy(() => import("../pages/customer/NewShipment"));
const EditProfile = lazy(() => import("../pages/customer/EditProfile"));
const MyShipmentDetails = lazy(() =>
  import("../pages/customer/MyShipmentDetails")
);
const FindShippers = lazy(() => import("../pages/customer/FindShippers"));
const TopRatedShippers = lazy(() =>
  import("../pages/customer/TopRatedShippers")
);

const ShipperProfilePage = lazy(() =>
  import("../pages/customer/ShipperProfile")
);
// ---------------- Driver Pages ----------------
const DriverLoginPage = lazy(() => import("../pages/Driver/DriverLoginPage"));
const DriverDashboard = lazy(() => import("../pages/Driver/DriverDashboard"));
const DriverDeliveryPage = lazy(() =>
  import("../pages/Driver/DriverDeliveryPage")
);
const DriverShipmentsPage = lazy(() =>
  import("../pages/Driver/DriverShipmentCard")
);

// ---------------- Common Pages ----------------
const Home = lazy(() => import("../pages/Home"));
const NotFoundPage = lazy(() => import("../pages/NotFound"));

const AppRoutes = () => {
  const { oauthLogin } = useAuth();
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
        oauthLogin({ token, role, provider, providerId, email, name, photo });
        navigate(`/${role}/dashboard`, { replace: true });
      }
    }
  }, [location, oauthLogin, navigate]);

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
        {/* ---------- Public Pages (Main Layout) ---------- */}
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={
              <RedirectIfAuth>
                <Home />
              </RedirectIfAuth>
            }
          />{" "}
          <Route path="/privacy-policy" element={<PrivacyPage />} />
          <Route path="/terms-conditions" element={<TermsPage />} />
          <Route path="/invite/:token" element={<InviteShipmentPage />} />
          <Route path="/verify" element={<NewsletterVerificationPage />} />
          <Route path="/newsletter-success" element={<NewsletterSuccess />} />
          <Route path="/newsletter-error" element={<NewsletterError />} />
        </Route>

        {/* ---------- Auth Pages ---------- */}
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
        <Route path="/oauth-error" element={<OAuthErrorPage />} />

        {/* ---------- Driver Routes ---------- */}
        <Route
          path="/driver/*"
          element={
            <DriverAuthProvider>
              <Routes>
                <Route path="login" element={<DriverLoginPage />} />

                <Route
                  path="dashboard"
                  element={
                    <ProtectedDriverRoute>
                      <DriverDashboard />
                    </ProtectedDriverRoute>
                  }
                />

                {/* NEW DELIVERY PAGE */}
                <Route
                  path="delivery/:shipmentId"
                  element={
                    <ProtectedDriverRoute>
                      <DriverDeliveryPage />
                    </ProtectedDriverRoute>
                  }
                />

                <Route
                  path="shipments"
                  element={
                    <ProtectedDriverRoute>
                      <DriverShipmentsPage />
                    </ProtectedDriverRoute>
                  }
                />
              </Routes>
            </DriverAuthProvider>
          }
        />

        {/* ---------- Shipper Routes ---------- */}
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
          <Route path="my-shipment" element={<ShipperContract />} />
          <Route path="invited-shipments" element={<InvitedShipments />} />
          <Route path="all-shipment" element={<AllShipments />} />
          <Route path="profile" element={<ShipperProfile />} />
          <Route path="vehicles" element={<VehiclesAndCapacity />} />
          <Route path="shipment-settings" element={<ShipmentSettings />} />
          <Route path="settings" element={<ShipperSettings />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="quotes" element={<ShipperQuotesPage />} />
          <Route path="earnings" element={<ShipperEarnings />} />
          <Route path="google-review" element={<GoogleReview />} />
          <Route path="track/:quoteId" element={<TrackShipmentPage />} />

          {/* LIST PAGE */}
          <Route path="shipments" element={<AllUpcomingShipments />} />

          {/* DETAILS PAGE (QUERY OR PARAM) */}
          <Route path="shipments/:id" element={<ShipmentDetails />} />

          <Route path="truck-driver" element={<TruckDriverPage />} />
          <Route path="chat" element={<ChatOverview />} />
        </Route>

        {/* ---------- Customer Routes ---------- */}
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
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="new-shipment" element={<NewShipment />} />
          <Route path="new-shipment/:id" element={<NewShipment />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="my-shipments" element={<MyShipmentDetails />} />
          <Route
            path="find-shippers/:shipmentId"
            element={<FindShippers />}
          />
          <Route path="chats" element={<CustomerChatOverview />} />
          <Route path="my-horses" element={<MyHorses />} />
          <Route path="all-shippers" element={<TopRatedShippers />} />
          <Route path="shipper-profile/:id" element={<ShipperProfilePage />} />
          <Route
            path="reviews/:shipperId"
            element={<CustomerShipperReviewPage />}
          />
          <Route path="track/:quoteId" element={<TrackShipmentPage />} />
        </Route>

        {/* ---------- Fallback ---------- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
