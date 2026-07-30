import { Outlet } from "react-router-dom";
import { isAuthenticated } from "@/features/auth/authStorage";
import { LangSwitch } from "./LangSwitch";
import { NavBar } from "./NavBar";

/** 全ページ共通レイアウト。ログイン時のみナビゲーションを表示する。 */
export function AppLayout() {
  return (
    <div className="app-shell">
      {isAuthenticated() ? (
        <NavBar />
      ) : (
        // 未ログインでも言語だけは切り替えられるようにする
        <div className="guest-bar">
          <LangSwitch />
        </div>
      )}
      <Outlet />
    </div>
  );
}
