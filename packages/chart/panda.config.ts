// panda.config.ts
import { defineConfig } from "@pandacss/dev";

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
      
    },
  },
});
