import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "vendor-react", test: /node_modules\/(react|react-dom|react-router|react-router-dom)\// },
            { name: "vendor-ui", test: /node_modules\/(react-icons|react-hot-toast|react-helmet-async)\// },
            { name: "vendor-api", test: /node_modules\/(axios|zod)\// },
          ],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    restoreMocks: true,
  },
});
