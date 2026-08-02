import { Outlet } from "react-router-dom";
import { ConsentBanner } from "@/components/ui/ConsentBanner";
import { isAuthenticated } from "@/features/auth/authStorage";
import { usePageView } from "@/hooks/useTracking";
import { LangSwitch } from "./LangSwitch";
import { NavBar } from "./NavBar";

/** 全ページ共通レイアウト。ログイン時のみナビゲーションを表示する。 */
export function AppLayout() {
  usePageView();

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
      <ConsentBanner />
    </div>
  );
}
