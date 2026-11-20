import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();
const STORAGE_KEY = "Artelix-theme";

function initialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved === "dark";
  } catch { /* Storage can be unavailable in private or restricted browsers. */ }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(initialTheme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    try { localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light"); } catch { /* Keep the toggle usable without storage. */ }
  }, [isDark]);
  useEffect(() => {
    const syncTheme = (event) => {
      if (event.key === STORAGE_KEY) setIsDark(event.newValue === "dark");
    };
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);
  const toggleTheme = () => setIsDark(previous => !previous);
  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
