// panda.config.ts
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  jsxFramework: "react",
  include: ["./src/**/*.{ts,tsx,js,jsx}"],
  exclude: [],
  outdir: "panda",
  syntax: "object-literal",
  // importMap: {
  //   css: '@acme/ui-lib/css',
  //   recipes: '@acme/ui-lib/recipes',
  //   patterns: '@acme/ui-lib/patterns',
  //   jsx: '@acme/ui-lib/jsx',
  // },
  globalVars: {
    '--popper-reference-width': '4px',
    // you can also generate a CSS @property
    '--button-color': {
      syntax: '<color>',
      inherits: false,
      initialValue: 'blue'
    }
  },
  theme: {
    extend: {
      tokens: {
        colors: {
          primary: { value: "red" },
        },
      },
      
    },
  },
});
