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

// ---------------- Driver Auth ----------------
import { DriverAuthProvider } from "../contexts/DriverAuthContext";
import ProtectedDriverRoute from "./ProtectedDriverRoute";
import PageLoader from "../components/common/PageLoader";

// ---------------- Auth Pages ----------------
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const SignupPage = lazy(() => import("../pages/auth/SignupPage"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage"));
const OAuthSuccessPage = lazy(() => import("../pages/auth/OAuthSuccessPage"));
const OAuthErrorPage = lazy(() => import("../pages/auth/OAuthErrorPage"));
const PrivacyPage = lazy(() => import("../pages/PrivacyPage"));
const TermsPage = lazy(() => import("../pages/TermsPage"));
const InviteShipmentPage = lazy(() => import("../pages/InviteShipmentPage"));
const NewsletterVerificationPage = lazy(() =>
  import("../pages/NewsletterVerificationPage")
);
const NewsletterSuccess = lazy(() => import("../pages/NewsletterSuccess"));
const NewsletterError = lazy(() => import("../pages/NewsletterError"));
const TrackShipmentPage = lazy(() => import("../pages/TrackShipmentPage"));

// ---------------- Shipper Pages ----------------
const ShipperLayout = lazy(() => import("../layouts/ShipperLayout"));
const ShipperDashboard = lazy(() => import("../pages/shipper/Dashboard"));
const ShipperContract = lazy(() => import("../pages/shipper/Contract"));
const ShipperProfile = lazy(() => import("../pages/shipper/Profile"));
const NotificationsPage = lazy(() =>
  import("../pages/shipper/NotificationsPage")
);
const TruckDriverPage = lazy(() => import("../pages/shipper/TruckDriverPage"));
const ShipperQuotesPage = lazy(() =>
  import("../pages/shipper/ShipperQuotesPage")
);
const GoogleReview = lazy(() => import("../pages/shipper/GoogleReview"));
const AllShipments = lazy(() => import("../pages/shipper/AllShipments"));
const InvitedShipments = lazy(() =>
  import("../pages/shipper/InvitedShipments")
);
const ShipperReviewsPage = lazy(() =>
  import("../pages/shipper/ShipperReviewsPage")
);
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
const SupportPage = lazy(() => import("../pages/common/SupportPage"));

// ---------------- Customer Pages ----------------
const CustomerLayout = lazy(() => import("../layouts/CustomerLayout"));
const CustomerDashboard = lazy(() => import("../pages/customer/CustDashboard"));
const CustomerOrders = lazy(() => import("../pages/customer/Orders"));
const CustomerProfile = lazy(() => import("../pages/customer/Profile"));
const CustomerSettings = lazy(() => import("../pages/customer/Settings"));
const NewShipment = lazy(() => import("../pages/customer/NewShipment"));
const EditProfile = lazy(() => import("../pages/customer/EditProfile"));
const CustomerChatOverview = lazy(() =>
  import("../pages/customer/ChatOverview")
);
const MyHorses = lazy(() => import("../pages/customer/MyHorses"));
const CustomerShipperReviewPage = lazy(() =>
  import("../pages/customer/CustomerShipperReviewPage")
);
const MyShipmentDetails = lazy(() =>
  import("../pages/customer/MyShipmentDetails")
);
const FindShippers = lazy(() => import("../pages/customer/FindShippers"));
const TopRatedShippers = lazy(() =>
  import("../pages/customer/TopRatedShippers")
);
const CustomerWishlist = lazy(() => import("../pages/customer/Wishlist"));

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
const HappyConsumers = lazy(() => import("../pages/HappyConsumers"));
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
      fallback={<PageLoader text="Loading, please wait..." fullScreen />}
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
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/privacy-policy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/terms-conditions" element={<TermsPage />} />
          <Route path="/invite/:token" element={<InviteShipmentPage />} />
          <Route path="/verify" element={<NewsletterVerificationPage />} />
          <Route path="/newsletter-success" element={<NewsletterSuccess />} />
          <Route path="/newsletter-error" element={<NewsletterError />} />
          <Route path="/happy-consumers" element={<HappyConsumers />} />
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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
                  path="forgot-password"
                  element={<ForgotPasswordPage />}
                />

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
          <Route path="reviews" element={<ShipperReviewsPage />} />
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
          <Route path="support" element={<SupportPage role="shipper" />} />
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
          <Route path="wishlist" element={<CustomerWishlist />} />
          <Route path="all-shippers" element={<TopRatedShippers />} />
          <Route path="shipper-profile/:id" element={<ShipperProfilePage />} />
          <Route path="support" element={<SupportPage role="customer" />} />
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
