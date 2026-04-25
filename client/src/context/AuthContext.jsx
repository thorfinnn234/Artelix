import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched            = useRef(false);

  const logout = useCallback(() => {
    localStorage.removeItem("Vendorly-token");
    setUser(null);
  }, []);

  const login = useCallback((userData, jwt) => {
    localStorage.setItem("Vendorly-token", jwt);
    setUser(userData);
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const token = localStorage.getItem("Vendorly-token");

    if (!token) {
      setLoading(false);
      return;
    }

    api.get("/me")
      .then((res) => {
        setUser(res.data.user); // ← fixed
      })
      .catch(() => {
        localStorage.removeItem("Vendorly-token");
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