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

  const fetchGoogleReviewLink = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE_URL}/shipper/reviews/google-link`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        setGoogleReviewLink(res.data.googleReviewLink || "");
      }
    } catch (err) {
      console.error(err);
      Toast.error(
        err.response?.data?.message || "Failed to fetch Google Review link"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateGoogleReviewLink = useCallback(
    async (link) => {
      if (!token) {
        Toast.error("Not authenticated");
        return;
      }

      setLoading(true);

      try {
        const res = await axios.put(
          `${API_BASE_URL}/shipper/reviews/google-link`,
          { googleReviewLink: link },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data?.success) {
          setGoogleReviewLink(link);

          Toast.success(
            googleReviewLink
              ? "Google Review Link Updated Successfully"
              : "Google Review Link Added Successfully"
          );
        } else {
          Toast.error(res.data?.message || "Something went wrong");
        }

        return res.data;
      } catch (err) {
        console.error(err);
        Toast.error(
          err.response?.data?.message || "Failed to update Google Review link"
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
    </ShipperReviewContext.Provider>
  );
};

export const useShipperReview = () => useContext(ShipperReviewContext);
