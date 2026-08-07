import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GuardianLayout from "./GuardianLayout";

export const GuardianRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "guardian") {
    return <Navigate to={user.role === "admin" ? "/" : "/resident"} replace />;
  }

  return <GuardianLayout>{children}</GuardianLayout>;
};
