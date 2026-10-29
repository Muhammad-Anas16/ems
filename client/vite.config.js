// import path from "path";
// import { defineConfig } from "vite";
// import babel from "@rolldown/plugin-babel";
// import tailwindcss from "@tailwindcss/vite";
// import react, { reactCompilerPreset } from "@vitejs/plugin-react";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     babel({ presets: [reactCompilerPreset()] }),
//     tailwindcss(),
//   ],
//   resolve: {
//     alias: {
//       "@": path.resolve(import.meta.dirname, "./src"),
//     },
//   },
// });

import path from "path";
import { defineConfig } from "vite";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],

  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
