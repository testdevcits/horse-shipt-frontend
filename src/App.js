import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CustomerPaymentProvider } from "./contexts/CustomerPaymentContext";
import { CustomerNotificationProvider } from "./contexts/CustomerNotificationContext"; // <-- import here
import AppRoutes from "./routes/AppRoutes";
import { VehicleProvider } from "./contexts/VehicleContext";
import { PreferredAreasProvider } from "./contexts/PreferredAreasContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CustomerPaymentProvider>
          <CustomerNotificationProvider>
            <VehicleProvider>
              <PreferredAreasProvider>
                <AppRoutes />
              </PreferredAreasProvider>
            </VehicleProvider>
          </CustomerNotificationProvider>
        </CustomerPaymentProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
