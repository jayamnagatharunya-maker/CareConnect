import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (data) => {
  try {
    const res = await api.post("/auth/login/", data);
    console.log("SUCCESS", res);
    return res;
  } catch (err) {
    console.log("LOGIN ERROR");
    console.log(err);
    console.log(err.response);
    console.log(err.response?.data);
    throw err;
  }
},
  register: (data) => api.post("/auth/register/", data),
  refresh: () => api.post("/auth/token/refresh/", { refresh: localStorage.getItem("refresh_token") }),
  logout: () => api.post("/auth/logout/", { refresh: localStorage.getItem("refresh_token") }),
  me: () => api.get("/auth/me/"),
};

export const societyApi = {
  list: (params) => api.get("/society/societies/", { params }),
  retrieve: (id) => api.get(`/society/societies/${id}/`),
  create: (data) => api.post("/society/societies/", data),
  update: (id, data) => api.put(`/society/societies/${id}/`, data),
  delete: (id) => api.delete(`/society/societies/${id}/`),
  blocks: (params) => api.get("/society/blocks/", { params }),
  createBlock: (data) => api.post("/society/blocks/", data),
  updateBlock: (id, data) => api.put(`/society/blocks/${id}/`, data),
  deleteBlock: (id) => api.delete(`/society/blocks/${id}/`),
  flats: (params) => api.get("/society/flats/", { params }),
  createFlat: (data) => api.post("/society/flats/", data),
  updateFlat: (id, data) => api.put(`/society/flats/${id}/`, data),
  deleteFlat: (id) => api.delete(`/society/flats/${id}/`),
};

export const usersApi = {
  pendingResidents: () => api.get("/auth/residents/pending/"),
  approveResident: (id, action, reason) => api.post(`/auth/residents/${id}/approve/`, { action, reason }),
  residentDirectory: (params) => api.get("/auth/residents/directory/", { params }),
  residentProfile: () => api.get("/auth/profile/resident/"),
  updateResidentProfile: (id, data) => api.put(`/auth/profile/resident/`, data),
  volunteerProfile: () => api.get("/auth/profile/volunteer/"),
  updateVolunteerProfile: (data) => api.put(`/auth/profile/volunteer/`, data),
  securityProfile: () => api.get("/auth/profile/security/"),
  updateSecurityProfile: (data) => api.put(`/auth/profile/security/`, data),
};

export const emergencyApi = {
  guardians: () => api.get("/emergency/guardians/"),
  createGuardian: (data) => api.post("/emergency/guardians/", data),

  contacts: () => api.get("/emergency/contacts/"),
  createContact: (data) => api.post("/emergency/contacts/", data),
  updateContact: (id, data) =>
    api.put(`/emergency/contacts/${id}/`, data),
  deleteContact: (id) =>
    api.delete(`/emergency/contacts/${id}/`),

  verifyContact: (id) =>
    api.post(`/emergency/contacts/${id}/verify/`),
};

export const sosApi = {
  categories: () => api.get("/sos/categories/"),
  list: () => api.get("/sos/"),
  detail: (id) => api.get(`/sos/${id}/`),
  updateStatus: (id, status) =>
    api.post(`/sos/${id}/status/`, { status }),
  guardianResponse: (id, response) =>
    api.post(`/sos/${id}/guardian-response/`, { response }),
  create: (data) => api.post("/sos/", data),
  broadcast: (data) => api.post("/sos/broadcast/", data),
};

export const dashboardApi = {
  summary: () => api.get("/dashboard/summary/"),
  notificationAnalytics: () => api.get("/notifications/analytics/"),
};

export const notificationsApi = {
  // Notifications
  list: () => api.get("/notifications/"),

  markRead: (id) =>
    api.post(`/notifications/${id}/read/`),

  // Templates
  templates: () =>
    api.get("/notifications/templates/"),

  createTemplate: (data) =>
    api.post("/notifications/templates/", data),

  updateTemplate: (id, data) =>
    api.put(`/notifications/templates/${id}/`, data),

  deleteTemplate: (id) =>
    api.delete(`/notifications/templates/${id}/`),
};

export const escalationApi = {
  // Response Configurations
  responseConfigs: () =>
    api.get("/escalation/response-configs/"),

  createConfig: (data) =>
    api.post("/escalation/response-configs/", data),

  updateConfig: (id, data) =>
    api.put(`/escalation/response-configs/${id}/`, data),

  deleteConfig: (id) =>
    api.delete(`/escalation/response-configs/${id}/`),

  // Escalation Logs
  escalationLogs: () =>
    api.get("/escalation/logs/"),

  // Trigger Escalation
  trigger: (sosId, data) =>
    api.post(`/escalation/trigger/?sos_id=${sosId}`, data),
};
