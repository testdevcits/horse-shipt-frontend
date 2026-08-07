import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { CUSTOMER_API_BASE_URL as API_BASE_URL } from "../../config/api";

const ReviewContext = createContext();
export const ReviewProvider = ({ children }) => {
  const { token } = useAuth();

  const [myReviews, setMyReviews] = useState([]);
  const [topRatedShippers, setTopRatedShippers] = useState([]);
  const [shipperProfile, setShipperProfile] = useState(null);
  const [wishlistShippers, setWishlistShippers] = useState([]);
  const [wishlistedShipperIds, setWishlistedShipperIds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [topShippersLoading, setTopShippersLoading] = useState(false);
  const [shipperProfileLoading, setShipperProfileLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

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

  // ================= FETCH CUSTOMER WISHLIST =================
  const fetchWishlist = useCallback(async () => {
    if (!token) {
      setWishlistShippers([]);
      setWishlistedShipperIds([]);
      return;
    }

    setWishlistLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shippers = res.data?.data || [];
      setWishlistShippers(shippers);
      setWishlistedShipperIds(
        shippers.map((shipper) => String(shipper.id || shipper._id))
      );
    } catch (err) {
      console.error("Fetch wishlist error", err);
      setWishlistShippers([]);
      setWishlistedShipperIds([]);
    } finally {
      setWishlistLoading(false);
    }
  }, [token]);

  // ================= TOGGLE CUSTOMER WISHLIST =================
  const toggleWishlist = useCallback(
    async (shipper) => {
      if (!token) throw new Error("Please login to add wishlist");

      const shipperId = String(shipper?.id || shipper?._id || "");
      if (!shipperId) throw new Error("Invalid shipper");

      const wasWishlisted = wishlistedShipperIds.includes(shipperId);

      setWishlistedShipperIds((prev) =>
        wasWishlisted
          ? prev.filter((id) => id !== shipperId)
          : [...new Set([...prev, shipperId])]
      );
      setWishlistShippers((prev) =>
        wasWishlisted
          ? prev.filter((item) => String(item.id || item._id) !== shipperId)
          : [{ ...shipper, id: shipperId, isWishlisted: true }, ...prev]
      );

      try {
        const res = await axios.post(
          `${API_BASE_URL}/wishlist/${shipperId}/toggle`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const isWishlisted = Boolean(res.data?.isWishlisted);
        setWishlistedShipperIds((prev) =>
          isWishlisted
            ? [...new Set([...prev, shipperId])]
            : prev.filter((id) => id !== shipperId)
        );
        setWishlistShippers((prev) =>
          isWishlisted
            ? prev.some((item) => String(item.id || item._id) === shipperId)
              ? prev
              : [{ ...shipper, id: shipperId, isWishlisted: true }, ...prev]
            : prev.filter((item) => String(item.id || item._id) !== shipperId)
        );

        return res.data;
      } catch (err) {
        setWishlistedShipperIds((prev) =>
          wasWishlisted
            ? [...new Set([...prev, shipperId])]
            : prev.filter((id) => id !== shipperId)
        );
        setWishlistShippers((prev) =>
          wasWishlisted
            ? prev.some((item) => String(item.id || item._id) === shipperId)
              ? prev
              : [{ ...shipper, id: shipperId, isWishlisted: true }, ...prev]
            : prev.filter((item) => String(item.id || item._id) !== shipperId)
        );

        const message =
          err.response?.data?.message || "Failed to update wishlist";
        throw new Error(message);
      }
    },
    [token, wishlistedShipperIds]
  );

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

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return (
    <ReviewContext.Provider
      value={{
        myReviews,
        topRatedShippers,
        shipperProfile,
        wishlistShippers,
        wishlistedShipperIds,
        loading,
        topShippersLoading,
        shipperProfileLoading,
        wishlistLoading,
        fetchMyReviews,
        addReview,
        fetchTopRatedShippers,
        fetchShipperProfile,
        fetchWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReview = () => useContext(ReviewContext);
