import { NavLink, useNavigate } from "react-router-dom";
import { clearToken } from "@/features/auth/authStorage";
import { useUnreadCount } from "@/features/matching/hooks/useUnreadCount";

const LINKS = [
  { to: "/discover", label: "さがす" },
  { to: "/matches", label: "マッチ", showBadge: true },
  { to: "/", label: "占い", end: true },
  { to: "/profile", label: "設定" },
];

/** ログイン後の共通ナビゲーション。 */
export function NavBar() {
  const navigate = useNavigate();
  const unread = useUnreadCount();

  function logout() {
    clearToken();
    navigate("/register", { replace: true });
  }

  return (
    <nav className="navbar">
      <div className="navbar-links">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            <span className="nav-label">
              {l.label}
              {l.showBadge && unread > 0 && <span className="badge">{unread}</span>}
            </span>
          </NavLink>
        ))}
      </div>
      <button className="logout-btn" onClick={logout}>
        ログアウト
      </button>
    </nav>
  );
}
