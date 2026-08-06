import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {k
    const token = localStorage.getItem("access_token");
    if (token) {
      authApi
        .me()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    console.log("Sending:", { email, password });

    const res = await authApi.login({
      email: email.trim(),
      password: password.trim(),
    });

    console.log("LOGIN RESPONSE:", res.data);
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    setUser({
      id: res.data.user_id,
      email: res.data.email,
      role: res.data.role,
    });
    return res.data;
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
