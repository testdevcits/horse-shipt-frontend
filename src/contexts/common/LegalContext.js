import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { BACKEND_BASE_URL as API_BASE_URL } from "../../config/api";

const LegalContext = createContext();

export const LegalProvider = ({ children }) => {
  const [privacyPolicies, setPrivacyPolicies] = useState([]);
  const [termsConditions, setTermsConditions] = useState([]);
  const [loading, setLoading] = useState(false);

 
  const fetchPrivacyPolicies = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/api/admin/privacy-policy/active`
      );
      const data = await res.json();

      if (data.success) {
        const activePolicies = data.data
          .filter((p) => p.isActive)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setPrivacyPolicies(activePolicies);
      } else {
        setPrivacyPolicies([]);
      }
    } catch (error) {
      console.error("Error fetching privacy policies", error);
      setPrivacyPolicies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // GET TERMS & CONDITIONS (ACTIVE)
  // =========================
  const fetchTermsConditions = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/api/admin/terms-condition/active`
      );
      const data = await res.json();

      if (data.success) {
        const activeTerms = data.data
          .filter((t) => t.isActive)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setTermsConditions(activeTerms);
      } else {
        setTermsConditions([]);
      }
    } catch (error) {
      console.error("Error fetching terms", error);
      setTermsConditions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchPrivacyPolicies();
    fetchTermsConditions();
  }, [fetchPrivacyPolicies, fetchTermsConditions]);

  return (
    <LegalContext.Provider
      value={{
        privacyPolicies,
        termsConditions,
        loading,
        refreshPrivacyPolicies: fetchPrivacyPolicies,
        refreshTermsConditions: fetchTermsConditions,
        refreshLegal: () => {
          fetchPrivacyPolicies();
          fetchTermsConditions();
        },
      }}
    >
      {children}
    </LegalContext.Provider>
  );
};

export const useLegal = () => useContext(LegalContext);
