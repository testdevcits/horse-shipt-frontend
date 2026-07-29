import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Toast from "../../components/common/Toast";
import { API_BASE_URL } from "../../config/api";

const CustomerReviewContext = createContext();

export const CustomerReviewProvider = ({ children }) => {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [myReviews, setMyReviews] = useState([]);
  const [shipperReviews, setShipperReviews] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  // ==========================================
  // Get My Reviews
  // ==========================================
  const fetchMyReviews = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/customer/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMyReviews(res.data?.data || []);
    } catch (err) {
      console.error("Fetch My Reviews Error:", err);
      setMyReviews([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ==========================================
  // Add Review
  // ==========================================
  const addReview = useCallback(
    async (reviewData) => {
      if (!token) return;

      setLoading(true);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/customer/reviews`,
          reviewData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data?.success) {
          showToast("Review added successfully", "success");
          await fetchMyReviews();
        } else {
          showToast(res.data?.message || "Failed to add review", "error");
        }

        return res.data;
      } catch (err) {
        showToast(
          err.response?.data?.message || "Error adding review",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [token, fetchMyReviews]
  );

  // ==========================================
  // Update Review
  // ==========================================
  const updateReview = useCallback(
    async (reviewId, reviewData) => {
      if (!token) return;

      setLoading(true);
      try {
        const res = await axios.put(
          `${API_BASE_URL}/customer/reviews/${reviewId}`,
          reviewData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data?.success) {
          showToast("Review updated successfully", "success");
          await fetchMyReviews();
        } else {
          showToast(res.data?.message || "Failed to update review", "error");
        }

        return res.data;
      } catch (err) {
        showToast(
          err.response?.data?.message || "Error updating review",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [token, fetchMyReviews]
  );

  // ==========================================
  // Delete Review
  // ==========================================
  const deleteReview = useCallback(
    async (reviewId) => {
      if (!token) return;

      setLoading(true);
      try {
        const res = await axios.delete(
          `${API_BASE_URL}/customer/reviews/${reviewId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data?.success) {
          showToast("Review deleted successfully", "success");
          await fetchMyReviews();
        } else {
          showToast(res.data?.message || "Failed to delete review", "error");
        }

        return res.data;
      } catch (err) {
        showToast(
          err.response?.data?.message || "Error deleting review",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [token, fetchMyReviews]
  );

  // ==========================================
  // Get Reviews By Shipper
  // ==========================================
  const fetchReviewsByShipper = useCallback(async (shipperId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/customer/shipper/${shipperId}`
      );

      setShipperReviews(res.data?.data || []);
    } catch (err) {
      console.error("Fetch Shipper Reviews Error:", err);
      setShipperReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <CustomerReviewContext.Provider
      value={{
        loading,
        myReviews,
        shipperReviews,
        addReview,
        updateReview,
        deleteReview,
        fetchMyReviews,
        fetchReviewsByShipper,
      }}
    >
      {children}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </CustomerReviewContext.Provider>
  );
};

export const useCustomerReview = () => useContext(CustomerReviewContext);
