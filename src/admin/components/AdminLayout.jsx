import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const menuItems = [
  { to: "/admin/about", label: "전시소개" },
  { to: "/admin/works", label: "작품" },
  { to: "/admin/designers", label: "디자이너" },
];

function AdminLayout({ children }) {
  const { logout, user } = useAuth();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="admin-sidebar__title">HELLO WORLD Admin</p>
        <nav className="admin-sidebar__nav" aria-label="관리 메뉴">
          {menuItems.map((item) => (
            <NavLink className="admin-sidebar__link" key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <p className="admin-sidebar__user">{user?.email}</p>
          <a className="admin-sidebar__site" href="/" target="_blank" rel="noreferrer">
            사이트 보기
          </a>
          <button className="admin-button admin-button--small" onClick={logout} type="button">
            로그아웃
          </button>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}

export default AdminLayout;
