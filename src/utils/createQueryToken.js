import jwtDecode from "jwt-decode";

// 🔹 Create a shipment query token including user info
export const createShipmentQueryToken = (shipmentId) => {
  const token = localStorage.getItem("token"); // login JWT
  if (!token) return null;

  try {
    const decoded = jwtDecode(token); // decode JWT

    // Include user info (_id, uniqueId, name) in the token
    const userInfo = {
      _id: decoded.id,
      uniqueId: decoded.uniqueId || "",
      name: decoded.name || "",
    };

    // Encode shipmentId, user info, and expiry
    return btoa(
      JSON.stringify({
        sid: shipmentId, // shipment ID
        user: userInfo, // logged-in user info
        exp: Date.now() + 5 * 60 * 1000, // 5 min expiry
      })
    );
  } catch (err) {
    console.error("Error creating shipment token:", err);
    return null;
  }
};

// 🔹 Validate shipment query token
export const validateShipmentQueryToken = (token, shipmentId) => {
  if (!token) return false;

  try {
    const decoded = JSON.parse(atob(token));

    // Check expiry
    if (decoded.exp < Date.now()) return false;

    // Check shipment ID
    if (decoded.sid !== shipmentId) return false;

    // Check user info exists
    if (!decoded.user || !decoded.user._id) return false;

    return true;
  } catch (err) {
    console.error("Invalid shipment token", err);
    return false;
  }
};
