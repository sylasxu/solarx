import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { pigment, extendTheme } from "@pigment-css/vite-plugin";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    pigment({
      theme: extendTheme({
        cssVarPrefix: "solarx",
        colorSchemes: {
          light: {
            colors: {
              background: '#f9f9f9',
              foreground: '#121212',
            },
          },
          dark: {
            colors: {
              background: '#212121',
              foreground: '#fff',
            },
          },
        },
        getSelector: (colorScheme) => colorScheme ? `.theme-${colorScheme}` : ':root',
        spacing: {
          xs: "0.25rem",
          sm: "0.5rem",
          md: "1rem",
          lg: "1.5rem",
          xl: "2rem",
        },
        borderRadius: {
          sm: "0.25rem",
          md: "0.375rem",
          lg: "0.5rem",
          xl: "0.75rem",
        },
      }),
      css: {
        defaultDirection: 'ltr',
        generateForBothDir: true,
      },
    }),
    react(),
    dts({
      insertTypesEntry: true,
      exclude: ["**/*.test.*", "**/*.spec.*"],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "SolarxUI",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
