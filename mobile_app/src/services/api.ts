import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = globalThis?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (data) => api.post("/auth/login/", data),
  register: (data) => api.post("/auth/register/", data),
  refresh: (refresh) => api.post("/auth/token/refresh/", { refresh }),
  logout: () => api.post("/auth/logout/", { refresh: globalThis?.refreshToken }),
  me: () => api.get("/auth/me/"),
};

export const societyApi = {
  list: (params) => api.get("/society/societies/", { params }),
  blocks: (params) => api.get("/society/blocks/", { params }),
  flats: (params) => api.get("/society/flats/", { params }),
};

export const emergencyApi = {
  guardians: () => api.get("/emergency/guardians/"),
  createGuardian: (data) => api.post("/emergency/guardians/", data),
  contacts: () => api.get("/emergency/contacts/"),
  createContact: (data) => api.post("/emergency/contacts/", data),
  verifyContact: (id) => api.post(`/emergency/contacts/${id}/verify/`),
};

export const sosApi = {
  categories: () => api.get("/sos/categories/"),
  create: (data) => api.post("/sos/", data),
  list: (params) => api.get("/sos/", { params }),
  updateStatus: (id, status) => api.post(`/sos/${id}/status/`, { status }),
  broadcast: (data) => api.post("/sos/broadcast/", data),
};

export const notificationsApi = {
  list: () => api.get("/notifications/"),
  markRead: (id) => api.post(`/notifications/${id}/read/`),
};
