import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 開発時 /api・/uploads を FastAPI に転送し、CORS を気にせず開発する
      "/api": "http://localhost:8000",
      "/uploads": "http://localhost:8000",
    },
  },
});
