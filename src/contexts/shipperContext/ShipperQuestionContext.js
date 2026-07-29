import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { API_BASE_URL } from "../../config/api";

const ShipperQuestionContext = createContext();
export const ShipperQuestionProvider = ({ children }) => {
  const { token } = useAuth();

  const [questions, setQuestions] = useState({ answered: [], pending: [] });
  const [loading, setLoading] = useState(false);

  // ================= FETCH QUESTIONS =================
  const fetchQuestions = useCallback(
    async (shipmentId) => {
      if (!token || !shipmentId) return;

      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/questions/${shipmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setQuestions(res.data?.data || { answered: [], pending: [] });
      } catch (err) {
        console.error("Fetch questions error", err);
        setQuestions({ answered: [], pending: [] });
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // ================= ASK QUESTION =================
  // inside ShipperQuestionContext
  const askQuestion = async (shipmentId, question) => {
    if (!token) return { success: false, message: "Authentication required" };
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/questions/ask`,
        { shipmentId, question },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuestions((prev) => ({
        ...prev,
        pending: [res.data.data, ...(prev?.pending || [])],
      }));

      return {
        success: true,
        message: res.data.message || "Question submitted successfully",
        data: res.data.data,
      };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          "Something went wrong. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShipperQuestionContext.Provider
      value={{
        questions,
        loading,
        fetchQuestions,
        askQuestion,
      }}
    >
      {children}
    </ShipperQuestionContext.Provider>
  );
};

export const useShipperQuestions = () => useContext(ShipperQuestionContext);
