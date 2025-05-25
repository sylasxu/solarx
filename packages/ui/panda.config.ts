// panda.config.ts
import { defineConfig } from "@pandacss/dev";
import { buttonRecipe } from "./src/design-system/recipes/button.recipe";
export default defineConfig({
  preflight: true,
  jsxFramework: "react",
  include: ["./src/**/*.{ts,tsx,js,jsx}"],
  exclude: [],
  outdir: "panda",
  syntax: "object-literal",
  // presets:[],
  // importMap: {
  //   css: '@acme/ui-lib/css',
  //   recipes: '@acme/ui-lib/recipes',
  //   patterns: '@acme/ui-lib/patterns',
  //   jsx: '@acme/ui-lib/jsx',
  // },
  theme: {
    extend: {
      // 扩展主题配置
      tokens: {
        colors: {
          primary: {
            50: { value: "#f0f9ff" },
            100: { value: "#e0f2fe" },
            200: { value: "#bae6fd" },
            300: { value: "#7dd3fc" },
            400: { value: "#38bdf8" },
            500: { value: "#0ea5e9" },
            600: { value: "#0284c7" },
            700: { value: "#0369a1" },
            800: { value: "#075985" },
            900: { value: "#0c4a6e" },
          },
          secondary: {
            // 定义次要颜色
            500: { value: "#6b7280" },
            600: { value: "#4b5563" },
            700: { value: "#374151" },
          },
          // 其他颜色...
        },
      },recipes: {
      button: buttonRecipe,
    },
    },
    
  },
});
