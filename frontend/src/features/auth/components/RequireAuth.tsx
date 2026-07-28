import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../authStorage";

/** 未ログインなら登録画面へリダイレクトするルートガード。 */
export function RequireAuth({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/register" replace />;
  }
  return <>{children}</>;
}
