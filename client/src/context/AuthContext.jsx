import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import api, { clearStoredToken, getStoredToken, setStoredToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  const login = useCallback((userData, jwt) => {
    setStoredToken(jwt);
    setUser(userData);
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const token = getStoredToken();

    if (!token) {
      setLoading(false);
      return;
    }

    api.get("/me")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        clearStoredToken();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
