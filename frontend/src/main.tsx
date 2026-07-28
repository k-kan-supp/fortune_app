import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// 本文・見出しとも Noto Sans JP に統一する（太さで差をつける）
import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/700.css";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
