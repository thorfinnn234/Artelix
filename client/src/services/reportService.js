import api from "./api";

export const misconductLabels = { safety: "Safety concern", fraud: "Fraud or scam", harassment: "Harassment", poor_service: "Poor service", other: "Other" };
export const supportLabels = { account: "My account", booking: "A booking", payment: "Payment", technical: "Technical problem", listing: "My listing", other: "Something else" };
export const reportCategoryLabel = (report) => (report.kind === "support" ? supportLabels : misconductLabels)[report.category] || report.category;

export const createReport = async (payload) => (await api.post("/reports", payload)).data;
export const createSupportRequest = async (payload) => (await api.post("/reports", { ...payload, kind: "support" })).data;
export const getMyReports = async () => (await api.get("/reports/mine")).data;
export const getAdminReports = async (params) => (await api.get("/reports/admin", { params })).data;
export const updateReport = async (id, payload) => (await api.patch(`/reports/admin/${id}`, payload)).data;
