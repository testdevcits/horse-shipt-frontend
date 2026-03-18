import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext"; // your auth context

const ReviewContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api/customer";

export const ReviewProvider = ({ children }) => {
  const { token } = useAuth();

  const [myReviews, setMyReviews] = useState([]);
  const [topRatedShippers, setTopRatedShippers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topShippersLoading, setTopShippersLoading] = useState(false);

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
          ...prev,
          {
            shipperId,
            shipmentId,
            rating,
            reviewText,
          },
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

  return (
    <ReviewContext.Provider
      value={{
        myReviews,
        topRatedShippers,
        loading,
        topShippersLoading,
        fetchMyReviews,
        addReview,
        fetchTopRatedShippers,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReview = () => useContext(ReviewContext);
