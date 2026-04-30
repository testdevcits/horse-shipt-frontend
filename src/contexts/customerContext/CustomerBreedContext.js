import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const CustomerBreedContext = createContext();

const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const CustomerBreedProvider = ({ children }) => {
  const { token } = useAuth();
  const [loading, ] = useState(false);
  const [breeds, setBreeds] = useState([]);

  const fetchBreeds = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/admin/breeds/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBreeds(res.data.data);
    } catch (err) {
      console.error("API ERROR:", err.response || err.message);
    }
  }, [token]);

  useEffect(() => {
    fetchBreeds();
  }, [token, fetchBreeds]);

  return (
    <CustomerBreedContext.Provider
      value={{
        loading,
        breeds,
        fetchBreeds,
      }}
    >
      {children}
    </CustomerBreedContext.Provider>
  );
};

export const useCustomerBreed = () => useContext(CustomerBreedContext);