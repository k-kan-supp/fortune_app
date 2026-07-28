import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { BlockedPage } from "@/pages/BlockedPage";
import { ChatPage } from "@/pages/ChatPage";
import { DiscoverPage } from "@/pages/DiscoverPage";
import { FortunePage } from "@/pages/FortunePage";
import { MatchesPage } from "@/pages/MatchesPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { VerifyPage } from "@/pages/VerifyPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* 公開ページ */}
          <Route path="/" element={<FortunePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/verify" element={<VerifyPage />} />

          {/* 要ログイン */}
          <Route
            path="/discover"
            element={
              <RequireAuth>
                <DiscoverPage />
              </RequireAuth>
            }
          />
          <Route
            path="/matches"
            element={
              <RequireAuth>
                <MatchesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/chat/:matchId"
            element={
              <RequireAuth>
                <ChatPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/blocked"
            element={
              <RequireAuth>
                <BlockedPage />
              </RequireAuth>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
