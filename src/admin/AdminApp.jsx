import { Navigate, Route, Routes } from "react-router-dom";
import { DESIGNERS_COLLECTION } from "../content/designersContent";
import { WORKS_COLLECTION } from "../content/worksContent";
import { AuthProvider } from "./auth/AuthContext";
import NewDocumentRedirect from "./components/NewDocumentRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import AboutManager from "./pages/AboutManager";
import DesignerEditorPage from "./pages/DesignerEditor";
import DesignersManager from "./pages/DesignersManager";
import LoginPage from "./pages/LoginPage";
import WorkEditorPage from "./pages/WorkEditor";
import WorksManager from "./pages/WorksManager";
import "./styles/admin.css";

const protectedRoutes = [
  ["/admin/about", <AboutManager />],
  ["/admin/works", <WorksManager />],
  [
    "/admin/works/new",
    <NewDocumentRedirect basePath="/admin/works" collectionId={WORKS_COLLECTION} />,
  ],
  ["/admin/works/:workId", <WorkEditorPage />],
  ["/admin/designers", <DesignersManager />],
  [
    "/admin/designers/new",
    <NewDocumentRedirect basePath="/admin/designers" collectionId={DESIGNERS_COLLECTION} />,
  ],
  ["/admin/designers/:designerId", <DesignerEditorPage />],
];

function AdminApp() {
  return (
    <AuthProvider>
      <div className="admin-root">
        <Routes>
          <Route path="/admin/login" element={<LoginPage />} />
          {protectedRoutes.map(([path, element]) => (
            <Route
              element={<ProtectedRoute>{element}</ProtectedRoute>}
              key={path}
              path={path}
            />
          ))}
          <Route path="*" element={<Navigate to="/admin/about" replace />} />
        </Routes>
        <p className="admin-mobile-notice">
          관리자 페이지는 PC 화면(1024px 이상)에서 사용해 주세요.
        </p>
      </div>
    </AuthProvider>
  );
}

export default AdminApp;
