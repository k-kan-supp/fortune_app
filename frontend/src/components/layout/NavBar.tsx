import { NavLink, useNavigate } from "react-router-dom";
import { clearToken } from "@/features/auth/authStorage";
import { useUnreadCount } from "@/features/matching/hooks/useUnreadCount";
import { useI18n, type MessageKey } from "@/i18n";
import { LangSwitch } from "./LangSwitch";

const LINKS: { to: string; labelKey: MessageKey; showBadge?: boolean; end?: boolean }[] = [
  { to: "/discover", labelKey: "nav.discover" },
  { to: "/matches", labelKey: "nav.matches", showBadge: true },
  { to: "/", labelKey: "nav.fortune", end: true },
  { to: "/profile", labelKey: "nav.settings" },
];

/** ログイン後の共通ナビゲーション。 */
export function NavBar() {
  const navigate = useNavigate();
  const unread = useUnreadCount();
  const { t } = useI18n();

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
              {t(l.labelKey)}
              {l.showBadge && unread > 0 && <span className="badge">{unread}</span>}
            </span>
          </NavLink>
        ))}
      </div>
      <div className="navbar-actions">
        <LangSwitch />
        <button className="logout-btn" onClick={logout}>
          {t("nav.logout")}
        </button>
      </div>
    </nav>
  );
}
