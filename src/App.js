import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CustomerPaymentProvider } from "./contexts/CustomerPaymentContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CustomerPaymentProvider>
          <AppRoutes />
        </CustomerPaymentProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
