import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AdminLayout from "./AdminLayout";

function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <p className="admin-screen-message">로그인 상태 확인 중...</p>;
  }

  if (status !== "admin") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export default ProtectedRoute;
