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
import { ShipperQuoteProvider } from "./contexts/shipperContext/ShipperQuoteContext";
import { ShipperShipmentProvider } from "./contexts/shipperContext/ShipperShipmentContext";
import { ShipperContractProvider } from "./contexts/shipperContext/ShipperContractContext";

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
                            <ShipperContractProvider>
                              <ShipperQuoteProvider>
                                <ShipperShipmentProvider>
                                  <DriverAuthProvider>
                                    <AppRoutes />
                                  </DriverAuthProvider>
                                </ShipperShipmentProvider>
                              </ShipperQuoteProvider>
                            </ShipperContractProvider>
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
