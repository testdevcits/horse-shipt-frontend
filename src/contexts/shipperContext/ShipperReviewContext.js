import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Toast from "../../components/common/Toast";

const ShipperReviewContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const ShipperReviewProvider = ({ children }) => {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [googleReviewLink, setGoogleReviewLink] = useState("");

  // Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  // ==========================================
  // GET Google Review Link
  // ==========================================
  const fetchGoogleReviewLink = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE_URL}/shipper/reviews/google-link`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        setGoogleReviewLink(res.data.googleReviewLink || "");
      }
    } catch (err) {
      console.error("Fetch Google Review Link Error:", err);
      showToast(
        err.response?.data?.message || "Failed to fetch Google Review link",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ==========================================
  // UPDATE Google Review Link
  // ==========================================
  const updateGoogleReviewLink = useCallback(
    async (link) => {
      if (!token) {
        showToast("Not authenticated", "error");
        return;
      }

      setLoading(true);

      try {
        const res = await axios.put(
          `${API_BASE_URL}/shipper/reviews/google-link`,
          { googleReviewLink: link },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data?.success) {
          setGoogleReviewLink(link);
          showToast(
            googleReviewLink
              ? "Google Review Link Updated Successfully"
              : "Google Review Link Added Successfully",
            "success"
          );
        } else {
          showToast(res.data?.message || "Something went wrong", "error");
        }

        return res.data;
      } catch (err) {
        console.error("Update Google Review Link Error:", err);

        showToast(
          err.response?.data?.message || "Failed to update Google Review link",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [token, googleReviewLink]
  );

  return (
    <ShipperReviewContext.Provider
      value={{
        loading,
        googleReviewLink,
        fetchGoogleReviewLink,
        updateGoogleReviewLink,
      }}
    >
      {children}

      {/* Toast Renderer */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </ShipperReviewContext.Provider>
  );
};

export const useShipperReview = () => useContext(ShipperReviewContext);
