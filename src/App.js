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

function App() {
  return (
    <Router>
      <AuthProvider>
        <CustomerPaymentProvider>
          <CustomerNotificationProvider>
            <VehicleProvider>
              <PreferredAreasProvider>
                <ShipperSettingsProvider>
                  <ShipperProfileProvider>
                    <ShipperLocationProvider>
                      <ShipperPreferredAreaProvider>
                        <AppRoutes />
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
