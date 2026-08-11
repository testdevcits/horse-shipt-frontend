import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// ------------------- Context Providers -------------------
import { AuthProvider } from "./contexts/AuthContext";
import { CustomerPaymentProvider } from "./contexts/customerContext/CustomerPaymentContext";
import { CustomerNotificationProvider } from "./contexts/CustomerNotificationContext";
import { VehicleProvider } from "./contexts/shipperContext/VehicleContext";
import { DriverProvider } from "./contexts/shipperContext/DriverContext";
import { ShipperSettingsProvider } from "./contexts/ShipperSettingsContext";
import { ShipperProfileProvider } from "./contexts/ShipperProfileContext";
import { ShipperLocationProvider } from "./contexts/shipperContext/ShipperLocationContext";
import { ShipperPreferredAreaProvider } from "./contexts/shipperContext/ShipperPreferredAreaContext";
import { CustomerShipmentProvider } from "./contexts/customerContext/CustomerShipmentContext";
import { CustomerQuoteProvider } from "./contexts/customerContext/CustomerQuoteContext";
import { ShipperQuoteProvider } from "./contexts/shipperContext/ShipperQuoteContext";
import { ShipperShipmentProvider } from "./contexts/shipperContext/ShipperShipmentContext";
import { ShipperContractProvider } from "./contexts/shipperContext/ShipperContractContext";
import { ShipperReviewProvider } from "./contexts/shipperContext/ShipperReviewContext";

// ------------------- Chat List Contexts -------------------
import { ShipperChatProvider } from "./contexts/shipperContext/ShipperChatContext";
import { CustomerChatProvider } from "./contexts/customerContext/CustomerChatContext";
import { CustomerReviewProvider } from "./contexts/customerContext/CustomerReviewContext";

// ------------------- Customer Profile Context -------------------
import { ProfileProvider } from "./contexts/customerContext/ProfileContext";

// ------------------- Driver Auth Context -------------------
import { DriverAuthProvider } from "./contexts/DriverAuthContext";

// ------------------- Question Contexts -------------------
import { CustomerQuestionProvider } from "./contexts/customerContext/CustomerQuestionContext";
import { ShipperQuestionProvider } from "./contexts/shipperContext/ShipperQuestionContext";

// ------------------- Routes -------------------
import AppRoutes from "./routes/AppRoutes";
import { ShipperPaymentProvider } from "./contexts/shipperContext/ShipperPaymentContext";
import { ShipperDeliveryProvider } from "./contexts/shipperContext/ShipperDeliveryContext";
import { LegalProvider } from "./contexts/common/LegalContext";
import { DeliveredShipmentProvider } from "./contexts/customerContext/DeliveredShipmentContext";
import { ReviewProvider } from "./contexts/customerContext/ReviewContext";

// ------------------- Import Newsletter Context -------------------
import { NewsletterProvider } from "./contexts/NewsletterContext";
import { SubscriptionProvider } from "./contexts/shipperContext/SubscriptionContext";
import { TrackingProvider } from "./contexts/common/TrackingContext";
import { CustomerMatchingProvider } from "./contexts/customerContext/CustomerMatchingContext";
import { ShipperInvitationProvider } from "./contexts/shipperContext/ShipperInvitationContext";
import RealtimeNotifications from "./components/RealtimeNotifications";
import { NotificationActivityProvider } from "./contexts/NotificationActivityContext";
import ScrollToTop from "./components/common/ScrollToTop";
import { SocketStatusProvider } from "./contexts/SocketStatusContext";
import { getGoogleMapsLoaderOptions } from "./constants/googleMapsLoader";

// ------------------- Stripe Setup -------------------
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const GoogleMapsPreloader = () => {
  useJsApiLoader(getGoogleMapsLoaderOptions());

  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <GoogleMapsPreloader />
        <LegalProvider>
          <AuthProvider>
            <SocketStatusProvider>
              <SubscriptionProvider>
                <CustomerPaymentProvider>
                {/* Wrap ShipperPaymentProvider with Elements for Stripe */}
                <ShipperPaymentProvider>
                  <Elements stripe={stripePromise}>
                    <CustomerNotificationProvider>
                      <VehicleProvider>
                        <DriverProvider>
                          <ShipperSettingsProvider>
                            <ShipperProfileProvider>
                              <ShipperReviewProvider>
                                <ShipperLocationProvider>
                                  <ShipperPreferredAreaProvider>
                                    <CustomerShipmentProvider>
                                      <CustomerQuoteProvider>
                                        <CustomerReviewProvider>
                                          <ReviewProvider>
                                            <ProfileProvider>
                                              <ShipperContractProvider>
                                                <ShipperQuoteProvider>
                                                  <ShipperShipmentProvider>
                                                    <ShipperDeliveryProvider>
                                                      <DriverAuthProvider>
                                                        <ShipperChatProvider>
                                                          <CustomerChatProvider>
                                                            <CustomerMatchingProvider>
                                                              <ShipperInvitationProvider>
                                                                <ShipperQuestionProvider>
                                                                  <CustomerQuestionProvider>
                                                                    <DeliveredShipmentProvider>
                                                                      <NewsletterProvider>
                                                                        <NotificationActivityProvider>
                                                                          <TrackingProvider>
                                                                            <AppRoutes />
                                                                            <RealtimeNotifications />
                                                                          </TrackingProvider>
                                                                        </NotificationActivityProvider>
                                                                      </NewsletterProvider>
                                                                    </DeliveredShipmentProvider>
                                                                  </CustomerQuestionProvider>
                                                                </ShipperQuestionProvider>
                                                              </ShipperInvitationProvider>
                                                            </CustomerMatchingProvider>
                                                          </CustomerChatProvider>
                                                        </ShipperChatProvider>
                                                      </DriverAuthProvider>
                                                    </ShipperDeliveryProvider>
                                                  </ShipperShipmentProvider>
                                                </ShipperQuoteProvider>
                                              </ShipperContractProvider>
                                            </ProfileProvider>
                                          </ReviewProvider>
                                        </CustomerReviewProvider>
                                      </CustomerQuoteProvider>
                                    </CustomerShipmentProvider>
                                  </ShipperPreferredAreaProvider>
                                </ShipperLocationProvider>
                              </ShipperReviewProvider>
                            </ShipperProfileProvider>
                          </ShipperSettingsProvider>
                        </DriverProvider>
                      </VehicleProvider>
                    </CustomerNotificationProvider>
                  </Elements>
                </ShipperPaymentProvider>
                </CustomerPaymentProvider>
              </SubscriptionProvider>
            </SocketStatusProvider>
          </AuthProvider>
        </LegalProvider>
    </Router>
  );
}

export default App;
