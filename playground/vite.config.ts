import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCssModule from 'vite-plugin-style-modules';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteCssModule()],
});
