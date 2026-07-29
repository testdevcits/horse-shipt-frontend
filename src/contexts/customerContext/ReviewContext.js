import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { CUSTOMER_API_BASE_URL as API_BASE_URL } from "../../config/api";

const ReviewContext = createContext();
export const ReviewProvider = ({ children }) => {
  const { token } = useAuth();

  const [myReviews, setMyReviews] = useState([]);
  const [topRatedShippers, setTopRatedShippers] = useState([]);
  const [shipperProfile, setShipperProfile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [topShippersLoading, setTopShippersLoading] = useState(false);
  const [shipperProfileLoading, setShipperProfileLoading] = useState(false);

  // ================= FETCH CUSTOMER REVIEWS =================
  const fetchMyReviews = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyReviews(res.data?.data || []);
    } catch (err) {
      console.error("Fetch reviews error", err);
      setMyReviews([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ================= ADD REVIEW =================
  const addReview = useCallback(
    async ({ shipperId, shipmentId, rating, reviewText }) => {
      if (!token) throw new Error("Not authenticated");

      try {
        const res = await axios.post(
          `${API_BASE_URL}/reviews`,
          { shipperId, shipmentId, rating, reviewText },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMyReviews((prev) => [
          res.data?.data || {
            shipperId,
            shipmentId,
            rating,
            reviewText,
          },
          ...prev,
        ]);

        return res.data;
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to submit review";
        throw new Error(message);
      }
    },
    [token]
  );

  // ================= FETCH TOP RATED SHIPPERS =================
  const fetchTopRatedShippers = useCallback(async () => {
    setTopShippersLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/shippers/top-rated`);
      setTopRatedShippers(res.data?.data || []);
    } catch (err) {
      console.error("Fetch top rated shippers error", err);
      setTopRatedShippers([]);
    } finally {
      setTopShippersLoading(false);
    }
  }, []);

  // ================= FETCH SHIPPER PROFILE DETAIL =================
  const fetchShipperProfile = useCallback(async (shipperId) => {
    if (!shipperId) return;

    setShipperProfileLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/shipper-profile/${shipperId}`
      );

      setShipperProfile(res.data?.data || null);
    } catch (err) {
      console.error("Fetch shipper profile error", err);
      setShipperProfile(null);
    } finally {
      setShipperProfileLoading(false);
    }
  }, []);

  return (
    <ReviewContext.Provider
      value={{
        myReviews,
        topRatedShippers,
        shipperProfile,
        loading,
        topShippersLoading,
        shipperProfileLoading,
        fetchMyReviews,
        addReview,
        fetchTopRatedShippers,
        fetchShipperProfile,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReview = () => useContext(ReviewContext);
