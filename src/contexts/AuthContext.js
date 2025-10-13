import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const logoutTimerRef = useRef(null);

  // ---------------- Helpers ----------------
  const clearAuthData = useCallback(() => {
    localStorage.removeItem("authData");
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearAuthData();
  }, [clearAuthData]);

  const setupAutoLogout = useCallback(
    (ms) => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = setTimeout(() => logout(), ms);
    },
    [logout]
  );

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

        const remainingTime = parsedData.tokenExpiry - Date.now();
        setupAutoLogout(remainingTime);
      } else {
        clearAuthData();
      }
    }

    return () => clearTimeout(logoutTimerRef.current);
  }, [setupAutoLogout, clearAuthData]);

  // ---------------- Login ----------------
  const login = (userData, authToken, expiresInSeconds = 3600) => {
    setUser(userData);
    setToken(authToken);

    const tokenExpiry = Date.now() + expiresInSeconds * 1000;

    const authData = {
      authToken,
      authUser: userData,
      token: authToken,
      tokenExpiry,
    };

    localStorage.setItem("authData", JSON.stringify(authData));

    setupAutoLogout(expiresInSeconds * 1000);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ---------------- Hook ----------------
export const useAuth = () => useContext(AuthContext);
