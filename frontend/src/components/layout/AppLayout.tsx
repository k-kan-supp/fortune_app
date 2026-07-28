import { Outlet } from "react-router-dom";
import { isAuthenticated } from "@/features/auth/authStorage";
import { NavBar } from "./NavBar";

/** 全ページ共通レイアウト。ログイン時のみナビゲーションを表示する。 */
export function AppLayout() {
  return (
    <div className="app-shell">
      {isAuthenticated() && <NavBar />}
      <Outlet />
    </div>
  );
}
