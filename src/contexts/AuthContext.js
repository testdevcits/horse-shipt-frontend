import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const logoutTimerRef = useRef(null);

  // ---------------- Initialize from localStorage ----------------
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      const isTokenValid =
        parsedData.tokenExpiry && parsedData.tokenExpiry > Date.now();

      if (isTokenValid) {
        setUser(parsedData.authUser);
        setToken(parsedData.authToken);

        // Setup auto-logout for remaining time
        const remainingTime = parsedData.tokenExpiry - Date.now();
        setupAutoLogout(remainingTime);
      } else {
        clearAuthData();
      }
    }
    return () => clearTimeout(logoutTimerRef.current);
  }, []);

  // ---------------- Login ----------------
  const login = (userData, authToken, expiresIn = 3600) => {
    setUser(userData);
    setToken(authToken);

    const tokenExpiry = Date.now() + expiresIn * 1000;

    const authData = {
      authToken,
      authUser: userData,
      token: authToken,
      tokenExpiry,
    };

    localStorage.setItem("authData", JSON.stringify(authData));

    setupAutoLogout(expiresIn * 1000);
  };

  // ---------------- Logout ----------------
  const logout = (callback) => {
    setUser(null);
    setToken(null);
    clearAuthData();
    if (typeof callback === "function") callback();
  };

  // ---------------- Helpers ----------------
  const setupAutoLogout = (ms) => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = setTimeout(() => logout(), ms);
  };

  const clearAuthData = () => {
    localStorage.removeItem("authData");
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ---------------- Hook ----------------
export const useAuth = () => useContext(AuthContext);
