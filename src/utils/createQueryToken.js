import jwtDecode from "jwt-decode";

// Simple helper to generate a random string
const generateRandomString = (length = 8) => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
};

export const createShipmentQueryToken = (shipmentId) => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    const userInfo = {
      _id: decoded.id,
      uniqueId: decoded.uniqueId || "",
      name: decoded.name || "",
    };

    // Add a random string to make the token unique each time
    const randomKey = generateRandomString(12);

    return btoa(
      JSON.stringify({
        sid: shipmentId,
        user: userInfo,
        exp: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
        rand: randomKey,
      })
    );
  } catch (err) {
    console.error("Error creating shipment token:", err);
    return null;
  }
};

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

    // rand key is just ignored here, only used to make token unique
    return true;
  } catch (err) {
    console.error("Invalid shipment token", err);
    return false;
  }
};
