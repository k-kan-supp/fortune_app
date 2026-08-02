
import ReactDOM from "react-dom/client";
import { CompatibilityModal } from "./features/matching/components/CompatibilityModal";
import { I18nProvider } from "./i18n";
import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/700.css";
import "./styles/global.css";
const payload = {"score":62.2,"facets":[{"code":"body","value":44.3},{"code":"heart","value":92},{"code":"mind","value":75.5},{"code":"support","value":27.9}],"notes":["branch.neutral","day_master.generates","mind.alike","element.similar"],"charts":[{"key":"five_elements","axes":["木","火","土","金","水"],"you":[4.2,29.4,23.5,40.3,2.5],"them":[2.5,8.2,25.4,39.3,24.6],"max_value":50,"highlight":["火","水"]},{"key":"ten_god_groups","axes":["比劫","食傷","財星","官殺","印星"],"you":[40.3,2.5,4.2,29.4,23.5],"them":[24.6,2.5,8.2,25.4,39.3],"max_value":50,"highlight":["印星","比劫"]}]};
// API を叩かずに固定の結果を描く
const orig = window.fetch;
window.fetch = async (u: RequestInfo | URL, i?: RequestInit) =>
  String(u).includes("/compatibility/")
    ? new Response(JSON.stringify(payload), { headers: { "content-type": "application/json" } })
    : orig(u, i);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <I18nProvider><div className="app-shell">
    <CompatibilityModal userId="x" name="ゆき さん" onClose={() => {}} />
  </div></I18nProvider>,
);
