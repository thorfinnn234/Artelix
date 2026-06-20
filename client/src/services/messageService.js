import api from "./api";

export const getConversations = async () => {
  const res = await api.get("/conversations");
  return res.data;
};

export const markAllConversationsRead = async () => {
  const res = await api.patch("/conversations/read-all");
  return res.data;
};

export const startArtisanConversation = async (artisanId) => {
  const res = await api.post(`/conversations/artisan/${artisanId}`);
  return res.data;
};

export const getConversationMessages = async (conversationId) => {
  const res = await api.get(`/conversations/${conversationId}/messages`);
  return res.data;
};

export const sendConversationMessage = async (conversationId, body) => {
  const res = await api.post(`/conversations/${conversationId}/messages`, { body });
  return res.data;
};
