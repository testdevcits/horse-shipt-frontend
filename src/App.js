import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CustomerPaymentProvider } from "./contexts/CustomerPaymentContext";
import { CustomerNotificationProvider } from "./contexts/CustomerNotificationContext";
import { VehicleProvider } from "./contexts/VehicleContext";
import { PreferredAreasProvider } from "./contexts/PreferredAreasContext";
import { ShipperSettingsProvider } from "./contexts/ShipperSettingsContext";
import { ShipperProfileProvider } from "./contexts/ShipperProfileContext";
import { ShipperLocationProvider } from "./contexts/ShipperLocationContext";
import AppRoutes from "./routes/AppRoutes";
import { ShipperPreferredAreaProvider } from "./contexts/ShipperPreferredAreaContext";
import { CustomerShipmentProvider } from "./contexts/customerContext/CustomerShipmentContext";
import { ShipperQuoteProvider } from "./contexts/shipperContext/ShipperQuoteContext";
import { ShipperShipmentProvider } from "./contexts/shipperContext/ShipperShipmentContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CustomerPaymentProvider>
          <CustomerNotificationProvider>
            <VehicleProvider>
              {" "}
              {/* VehicleProvider wraps the shipment-related components */}
              <PreferredAreasProvider>
                <ShipperSettingsProvider>
                  <ShipperProfileProvider>
                    <ShipperLocationProvider>
                      <ShipperPreferredAreaProvider>
                        <CustomerShipmentProvider>
                          <ShipperQuoteProvider>
                            <ShipperShipmentProvider>
                              <AppRoutes />{" "}
                              {/* ShipmentDetails should be rendered inside AppRoutes */}
                            </ShipperShipmentProvider>
                          </ShipperQuoteProvider>
                        </CustomerShipmentProvider>
                      </ShipperPreferredAreaProvider>
                    </ShipperLocationProvider>
                  </ShipperProfileProvider>
                </ShipperSettingsProvider>
              </PreferredAreasProvider>
            </VehicleProvider>
          </CustomerNotificationProvider>
        </CustomerPaymentProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
