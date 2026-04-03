// context/NewsletterContext.js
import React, { createContext, useContext, useReducer } from "react";
import axios from "axios";

// ------------------- Base URL -------------------
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

// ------------------- Initial State -------------------
const initialState = {
  loading: false,
  success: null,
  error: null,
};

// ------------------- Actions -------------------
const ACTIONS = {
  SUBSCRIBE_REQUEST: "SUBSCRIBE_REQUEST",
  SUBSCRIBE_SUCCESS: "SUBSCRIBE_SUCCESS",
  SUBSCRIBE_FAIL: "SUBSCRIBE_FAIL",
  RESET: "RESET",
};

// ------------------- Reducer -------------------
const newsletterReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SUBSCRIBE_REQUEST:
      return { ...state, loading: true, success: null, error: null };
    case ACTIONS.SUBSCRIBE_SUCCESS:
      return { ...state, loading: false, success: action.payload, error: null };
    case ACTIONS.SUBSCRIBE_FAIL:
      return { ...state, loading: false, success: null, error: action.payload };
    case ACTIONS.RESET:
      return initialState;
    default:
      return state;
  }
};

// ------------------- Context -------------------
const NewsletterContext = createContext();

// ------------------- Provider -------------------
export const NewsletterProvider = ({ children }) => {
  const [state, dispatch] = useReducer(newsletterReducer, initialState);

  // ------------------- Subscribe Function -------------------
  const subscribe = async (email) => {
    dispatch({ type: ACTIONS.SUBSCRIBE_REQUEST });
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/horse-newsletter/subscribe`,
        { email }
      );
      dispatch({ type: ACTIONS.SUBSCRIBE_SUCCESS, payload: data.message });
    } catch (error) {
      dispatch({
        type: ACTIONS.SUBSCRIBE_FAIL,
        payload:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    }
  };

  // ------------------- Verify Function -------------------
  const verify = async (token) => {
    try {
      console.log("[DEBUG] Calling verify API with token:", token);
      const { data } = await axios.get(
        `${API_BASE_URL}/horse-newsletter/verify?token=${token}`
      );
      console.log("[DEBUG] Verify API response:", data);
      return data; // expects { success: true/false, message: "..." }
    } catch (error) {
      console.error(
        "[ERROR] Verify API:",
        error.response?.data || error.message
      );
      return { success: false, message: "Something went wrong." };
    }
  };

  // ------------------- Reset Function -------------------
  const resetNewsletter = () => {
    dispatch({ type: ACTIONS.RESET });
  };

  return (
    <NewsletterContext.Provider
      value={{ ...state, subscribe, verify, resetNewsletter }}
    >
      {children}
    </NewsletterContext.Provider>
  );
};

// ------------------- Hook -------------------
export const useNewsletter = () => useContext(NewsletterContext);
