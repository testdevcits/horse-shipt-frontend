import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const CustomerQuestionContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const CustomerQuestionProvider = ({ children }) => {
  const { token } = useAuth();

  const [questions, setQuestions] = useState({ answered: [], pending: [] });
  const [loading, setLoading] = useState(false);

  // 🔹 Get all questions for shipment
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
        console.error("Customer fetch questions error", err);
        setQuestions({ answered: [], pending: [] });
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // 🔹 Answer Question
  const answerQuestion = async (questionId, answer) => {
    if (!token) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/questions/answer`,
        { questionId, answer },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // update state: move question from pending -> answered
      setQuestions((prev) => ({
        answered: [...prev.answered, res.data.data],
        pending: prev.pending.filter((q) => q._id !== questionId),
      }));

      return res.data;
    } catch (err) {
      console.error("Customer answer error", err);
      throw err.response?.data || { success: false, message: "Unknown error" };
    }
  };

  return (
    <CustomerQuestionContext.Provider
      value={{
        questions,
        loading,
        fetchQuestions,
        answerQuestion,
      }}
    >
      {children}
    </CustomerQuestionContext.Provider>
  );
};

export const useCustomerQuestions = () => useContext(CustomerQuestionContext);
