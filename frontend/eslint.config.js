import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // ビルド成果物と、スクリーンショット用の使い捨てハーネス（src/__*.tsx）は対象外
    ignores: ["dist", "node_modules", "src/__*.tsx"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  {
    // i18n のバレルは Provider・フック・翻訳ヘルパを意図的に同居させている。
    // Fast Refresh の粒度が落ちるだけで不具合ではないため、ここだけ無効化する。
    files: ["src/i18n/index.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
);
