import React, { lazy } from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const ShipperLayout = lazy(() => import("../layouts/ShipperLayout"));
const ShipperDashboard = lazy(() => import("../pages/shipper/Dashboard"));
const ShipperOrders = lazy(() => import("../pages/shipper/Orders"));

const ShipperRoutes = () => {
  return (
    <Route
      path="/shipper"
      element={
        <ProtectedRoute role="shipper">
          <ShipperLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard" element={<ShipperDashboard />} />
      <Route path="orders" element={<ShipperOrders />} />
      {/* Add more shipper pages here */}
    </Route>
  );
};

export default ShipperRoutes;
