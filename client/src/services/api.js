import axios from "axios";

export const TOKEN_KEY = "Artelix-token";
export const LEGACY_TOKEN_KEY = "Artisyn-token";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function setStoredToken(token) {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export function getApiAuthUrl(path) {
  const baseURL = api.defaults.baseURL.replace(/\/$/, "");
  const authPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseURL}/auth${authPath}`;
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
