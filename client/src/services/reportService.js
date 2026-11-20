import api from "./api";

export const createReport = async (payload) => (await api.post("/reports", payload)).data;
export const getMyReports = async () => (await api.get("/reports/mine")).data;
export const getAdminReports = async (params) => (await api.get("/reports/admin", { params })).data;
export const updateReport = async (id, payload) => (await api.patch(`/reports/admin/${id}`, payload)).data;
