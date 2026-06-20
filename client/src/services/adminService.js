import api from "./api";

export const getAdminStats = async () => {
  const res = await api.get("/admin/stats");
  return res.data;
};

export const getAdminArtisan = async (params) => {
  const res = await api.get("/artisan/admin/all", { params });
  return res.data;
};

export const approveArtisan = async (id) => {
  const res = await api.patch(`/artisan/${id}/approve`);
  return res.data;
};

export const rejectArtisan = async (id, reason = "") => {
  const res = await api.patch(`/artisan/${id}/reject`, { reason });
  return res.data;
};

export const suspendArtisan = async (id, reason = "") => {
  const res = await api.patch(`/artisan/${id}/suspend`, { reason });
  return res.data;
};

export const unsuspendArtisan = async (id) => {
  const res = await api.patch(`/artisan/${id}/unsuspend`);
  return res.data;
};

export const deleteArtisan = async (id) => {
  const res = await api.delete(`/artisan/${id}`);
  return res.data;
};

export const getAdminUsers = async (params) => {
  const res = await api.get("/admin/users", { params });
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

export const suspendUser = async (id) => {
  const res = await api.patch(`/admin/users/${id}/suspend`);
  return res.data;
};

export const unsuspendUser = async (id) => {
  const res = await api.patch(`/admin/users/${id}/unsuspend`);
  return res.data;
};