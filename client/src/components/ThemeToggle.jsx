import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  return <button type="button" onClick={toggleTheme} className="theme-toggle" aria-label={label} aria-pressed={isDark} title={label}>{isDark ? <Sun size={18}/> : <Moon size={18}/>}</button>;
}
