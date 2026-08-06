import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// ================= REQUEST INTERCEPTOR =================
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");

  console.log("================================");
  console.log("REQUEST URL:", (config.baseURL || "") + (config.url || ""));
  console.log("REQUEST DATA:", config.data);
  console.log("TOKEN FROM STORAGE:", token);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("AUTH HEADER:", config.headers?.Authorization);
  console.log("================================");

  return config;
});

// ================= AUTH =================
export const authApi = {
  login: (data: any) => {
    console.log("LOGIN REQUEST:", data);
    return api.post("/auth/login/", data);
  },

  register: (data: any) =>
    api.post("/auth/register/", data),

  refresh: (refresh: string) =>
    api.post("/auth/token/refresh/", { refresh }),

  logout: async () => {
    const refresh = await AsyncStorage.getItem("refreshToken");

    return api.post("/auth/logout/", {
      refresh,
    });
  },

  me: () =>
    api.get("/auth/me/"),
};

// ================= PROFILE =================
export const profileApi = {
  save: (data: any) => {
    console.log("PROFILE SAVE:", data);
    return api.put("/auth/profile/resident/", data);
  },
};

// ================= DEVICE TOKEN =================
export const deviceApi = {
  register: (token: string, platform: string) =>
    api.post("/auth/device-token/", { token, platform }),
};

// ================= SOCIETY =================
export const societyApi = {
  list: (params = {}) =>
    api.get("/society/societies/", { params }),

  blocks: (params: any) =>
    api.get("/society/blocks/", { params }),

  flats: (params: any) =>
    api.get("/society/flats/", { params }),
};

// ================= EMERGENCY =================
export const emergencyApi = {
  guardians: () =>
    api.get("/emergency/guardians/"),

  createGuardian: (data: any) =>
    api.post("/emergency/guardians/", data),

  contacts: () =>
    api.get("/emergency/contacts/"),

  createContact: (data: any) =>
    api.post("/emergency/contacts/", data),

  verifyContact: (id: number) =>
    api.post(`/emergency/contacts/${id}/verify/`),

  deleteContact: (id: number) =>
    api.delete(`/emergency/contacts/${id}/`),
};

// ================= SOS =================
export const sosApi = {
  categories: () =>
    api.get("/sos/categories/"),

  create: (data: any) =>
    api.post("/sos/", data),

  list: (params = {}) =>
    api.get("/sos/", { params }),

  updateStatus: (id: number, status: string) =>
    api.post(`/sos/${id}/status/`, { status }),

  guardianResponse: (id: number) =>
    api.post(`/sos/${id}/guardian-response/`),

  broadcast: (data: any) =>
    api.post("/sos/broadcast/", data),
};

// ================= NOTIFICATIONS =================
export const notificationsApi = {
  list: () =>
    api.get("/notifications/"),

  markRead: (id: number) =>
    api.post(`/notifications/${id}/read/`),
};

// ================= RESPONSE INTERCEPTOR =================
api.interceptors.response.use(
  (response) => {
    console.log("========== SUCCESS ==========");
    console.log("URL:", response.config.url);
    console.log("STATUS:", response.status);
    console.log("DATA:", response.data);
    console.log("=============================");
    return response;
  },
  (error) => {
    console.log("========== AXIOS ERROR ==========");
    console.log("URL:", error.config?.url);
    console.log("MESSAGE:", error.message);
    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);
    console.log("=================================");
    return Promise.reject(error);
  }
);