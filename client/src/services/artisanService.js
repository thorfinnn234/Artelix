import api from "./api";

export const getArtisan = async (params) => {
  const res = await api.get("/artisan", { params });
  return res.data;
};

export const getArtisanById = async (id) => {
  const res = await api.get(`/artisan/${id}`);
  return res.data;
};

export const getArtisanWorks = async (id) => {
  const res = await api.get(`/artisan/${id}/works`);
  return res.data;
};

export const rateArtisan = async (id, rating) => {
  const res = await api.post(`/artisan/${id}/rating`, { rating });
  return res.data;
};

export const getMyArtisan = async () => {
  const res = await api.get("/artisan/me");
  return res.data;
};

export const updateMyArtisan = async (data) => {
  const res = await api.patch("/artisan/me", data);
  return res.data;
};

export const getMyWorks = async (params) => {
  const res = await api.get("/artisan/me/works", { params });
  return res.data;
};

export const createMyWork = async (data) => {
  const res = await api.post("/artisan/me/works", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getSavedArtisan = async () => {
  const res = await api.get("/me/saved");
  return res.data;
};

export const saveArtisan = async (ArtisanId) => {
  const res = await api.post(`/me/saved/${ArtisanId}`);
  return res.data;
};

export const unsaveArtisan = async (ArtisanId) => {
  const res = await api.delete(`/me/saved/${ArtisanId}`);
  return res.data;
};
