import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";

/**
 * fontsource の CSS は woff2 と旧形式 woff の両方を参照するため、
 * そのままだとビルド成果物に使われない woff が大量に含まれる。
 * woff2 のみ残してビルドサイズを半分に抑える。
 */
function fontsourceWoff2Only(): Plugin {
  return {
    name: "fontsource-woff2-only",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("@fontsource") || !id.endsWith(".css")) return null;
      return code.replace(/,\s*url\([^)]+\.woff\)\s*format\('woff'\)/g, "");
    },
  };
}

export default defineConfig(({ mode }) => {
  // 転送先は .env で差し替えられる（8000 が他プロジェクトで埋まっている場合や、
  // Docker のデモスタック（backend は 8001 公開）に繋ぐときに使う）
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const apiTarget = env.VITE_API_PROXY_TARGET || "http://localhost:8000";

  return {
    plugins: [fontsourceWoff2Only(), react()],
    resolve: {
      // tsconfig の "@/*" と揃える（Vite/Rollup は独自に alias 解決が必要）
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        // 開発時 /api・/uploads を FastAPI に転送し、CORS を気にせず開発する
        // ws:true で WebSocket（リアルタイムチャット）もプロキシする
        "/api": { target: apiTarget, ws: true },
        "/uploads": apiTarget,
      },
    },
  };
});
