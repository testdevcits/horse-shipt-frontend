import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

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

// ------------------- Chat List Contexts -------------------
import { ShipperChatProvider } from "./contexts/shipperContext/ShipperChatContext";
import { CustomerChatProvider } from "./contexts/customerContext/CustomerChatContext";

// ------------------- Customer Profile Context -------------------
import { ProfileProvider } from "./contexts/customerContext/ProfileContext";

// ------------------- Driver Auth Context -------------------
import { DriverAuthProvider } from "./contexts/DriverAuthContext";

// ------------------- Routes -------------------
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <Router>
      {/* Shipper & Customer Contexts */}
      <AuthProvider>
        <CustomerPaymentProvider>
          <CustomerNotificationProvider>
            <VehicleProvider>
              <DriverProvider>
                <PreferredAreasProvider>
                  <ShipperSettingsProvider>
                    <ShipperProfileProvider>
                      <ShipperLocationProvider>
                        <ShipperPreferredAreaProvider>
                          <CustomerShipmentProvider>
                            <CustomerQuoteProvider>
                              <ProfileProvider>
                                <ShipperContractProvider>
                                  <ShipperQuoteProvider>
                                    <ShipperShipmentProvider>
                                      <DriverAuthProvider>
                                        <ShipperChatProvider>
                                          <CustomerChatProvider>
                                            <AppRoutes />
                                          </CustomerChatProvider>
                                        </ShipperChatProvider>
                                      </DriverAuthProvider>
                                    </ShipperShipmentProvider>
                                  </ShipperQuoteProvider>
                                </ShipperContractProvider>
                              </ProfileProvider>
                            </CustomerQuoteProvider>
                          </CustomerShipmentProvider>
                        </ShipperPreferredAreaProvider>
                      </ShipperLocationProvider>
                    </ShipperProfileProvider>
                  </ShipperSettingsProvider>
                </PreferredAreasProvider>
              </DriverProvider>
            </VehicleProvider>
          </CustomerNotificationProvider>
        </CustomerPaymentProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
