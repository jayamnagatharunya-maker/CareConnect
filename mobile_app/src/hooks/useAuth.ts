import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../services/api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("LOADED TOKEN:", token);
      const refresh = await AsyncStorage.getItem("refreshToken");

      globalThis.accessToken = token;
      globalThis.refreshToken = refresh;

      if (token) {
        try {
          const res = await authApi.me();
          setUser(res.data);
        } catch (e) {
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("refreshToken");

          globalThis.accessToken = null;
          globalThis.refreshToken = null;
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);

    const res = await authApi.login({
      email,
      password,
    });

    console.log("LOGIN RESPONSE:", res.data);

    await AsyncStorage.setItem("accessToken", res.data.access);
    await AsyncStorage.setItem("refreshToken", res.data.refresh);
    const saved = await AsyncStorage.getItem("accessToken");
    console.log("SAVED TOKEN:", saved);

    globalThis.accessToken = res.data.access;
    globalThis.refreshToken = res.data.refresh;

    setUser({
      id: res.data.user_id,
      email: res.data.email,
      role: res.data.role,
    });

    return res.data;
  };

  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
    role: string,
    phoneNumber: string
  ) => {
    const res = await authApi.register({
      email: email.trim(),
      password: password.trim(),
      password2: confirmPassword.trim(),
      role,
      phone_number: phoneNumber.trim(),
    });

    return res.data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {}

    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");

    globalThis.accessToken = null;
    globalThis.refreshToken = null;

    setUser(null);
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
  };
}