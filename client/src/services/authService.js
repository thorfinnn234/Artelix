import api from "./api";

export const loginUser = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const registerUser = async (formData) => {
  const res = await api.post("/auth/Register", formData); // ← capital R
  return res.data;
};

export const logoutUser = async () => {
  await api.post("/auth/logout");
};

export const getMe = async () => {
  const res = await api.get("/me");  // ← your backend uses /api/me
  return res.data;
};