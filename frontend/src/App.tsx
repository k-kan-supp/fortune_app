import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { FortunePage } from "@/pages/FortunePage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { VerifyPage } from "@/pages/VerifyPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FortunePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/verify" element={<VerifyPage />} />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
