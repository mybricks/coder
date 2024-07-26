import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/copilot': {
        target: 'https://ai-gateway.corp.kuaishou.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/copilot/, '')
      }
    }
  }
});
