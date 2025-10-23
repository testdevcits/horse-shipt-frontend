import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CustomerPaymentProvider } from "./contexts/CustomerPaymentContext";
import { CustomerNotificationProvider } from "./contexts/CustomerNotificationContext"; // <-- import here
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CustomerPaymentProvider>
          <CustomerNotificationProvider>
            <AppRoutes />
          </CustomerNotificationProvider>
        </CustomerPaymentProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
