import api from "./api";

export const getVendors = async (params) => {
  const res = await api.get("/vendors", { params });
  return res.data;
};

export const getVendorById = async (id) => {
  const res = await api.get(`/vendors/${id}`);
  return res.data;
};

export const getSavedVendors = async () => {
  const res = await api.get("/me/saved");
  return res.data;
};

export const saveVendor = async (vendorId) => {
  const res = await api.post(`/me/saved/${vendorId}`);
  return res.data;
};

export const unsaveVendor = async (vendorId) => {
  const res = await api.delete(`/me/saved/${vendorId}`);
  return res.data;
};