import { useState, useEffect } from "react";
import { authApi } from "../services/api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = globalThis?.accessToken;
    if (token) {
      authApi
        .me()
        .then((res) => setUser(res.data))
        .catch(() => {
          globalThis.accessToken = null;
          globalThis.refreshToken = null;
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
  console.log("EMAIL:", email);
  console.log("PASSWORD:", password);

  console.log("EMAIL:", email);
console.log("PASSWORD:", password);

const res = await authApi.login({
  email: email.trim(),
  password: password.trim(),
});

  globalThis.accessToken = res.data.access;
  globalThis.refreshToken = res.data.refresh;

  setUser({
    id: res.data.user_id,
    email: res.data.email,
    role: res.data.role,
  });

  return res.data;
};

  const logout = async () => {
    await authApi.logout();
    globalThis.accessToken = null;
    globalThis.refreshToken = null;
    setUser(null);
  };

  return { user, login, logout, loading };
}
