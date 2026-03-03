import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";

// ------------------- Context Providers -------------------
import { AuthProvider } from "./contexts/AuthContext";
import { CustomerPaymentProvider } from "./contexts/CustomerPaymentContext";
import { CustomerNotificationProvider } from "./contexts/CustomerNotificationContext";
import { VehicleProvider } from "./contexts/shipperContext/VehicleContext";
import { DriverProvider } from "./contexts/shipperContext/DriverContext";
import { PreferredAreasProvider } from "./contexts/PreferredAreasContext";
import { ShipperSettingsProvider } from "./contexts/ShipperSettingsContext";
import { ShipperProfileProvider } from "./contexts/ShipperProfileContext";
import { ShipperLocationProvider } from "./contexts/shipperContext/ShipperLocationContext";
import { ShipperPreferredAreaProvider } from "./contexts/ShipperPreferredAreaContext";
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

const GOOGLE_LIBRARIES = ["places"];

function App() {
  return (
    <Router>
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        libraries={GOOGLE_LIBRARIES}
      >
        {/* Shipper & Customer Contexts */}
        <AuthProvider>
          <CustomerPaymentProvider>
            <ShipperPaymentProvider>
              <CustomerNotificationProvider>
                <VehicleProvider>
                  <DriverProvider>
                    <PreferredAreasProvider>
                      <ShipperSettingsProvider>
                        <ShipperProfileProvider>
                          {" "}
                          <ShipperReviewProvider>
                            <ShipperLocationProvider>
                              <ShipperPreferredAreaProvider>
                                <CustomerShipmentProvider>
                                  <CustomerQuoteProvider>
                                    <CustomerReviewProvider>
                                      <ProfileProvider>
                                        <ShipperContractProvider>
                                          <ShipperQuoteProvider>
                                            <ShipperShipmentProvider>
                                              <DriverAuthProvider>
                                                <ShipperChatProvider>
                                                  <CustomerChatProvider>
                                                    <ShipperQuestionProvider>
                                                      <CustomerQuestionProvider>
                                                        <AppRoutes />
                                                      </CustomerQuestionProvider>
                                                    </ShipperQuestionProvider>
                                                  </CustomerChatProvider>
                                                </ShipperChatProvider>
                                              </DriverAuthProvider>
                                            </ShipperShipmentProvider>
                                          </ShipperQuoteProvider>
                                        </ShipperContractProvider>
                                      </ProfileProvider>
                                    </CustomerReviewProvider>
                                  </CustomerQuoteProvider>
                                </CustomerShipmentProvider>
                              </ShipperPreferredAreaProvider>
                            </ShipperLocationProvider>
                          </ShipperReviewProvider>
                        </ShipperProfileProvider>
                      </ShipperSettingsProvider>
                    </PreferredAreasProvider>
                  </DriverProvider>
                </VehicleProvider>
              </CustomerNotificationProvider>
            </ShipperPaymentProvider>
          </CustomerPaymentProvider>
        </AuthProvider>
      </LoadScript>
    </Router>
  );
}

export default App;
