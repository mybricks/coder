import { defineConfig } from "father";

export default defineConfig({
  define: {
    VERSION: JSON.stringify(process.env.npm_package_version),
  },
  esm: {},
  umd: {
    name: "Editor",
    output: {
      filename: "index.js",
    },
    externals: {
      react: {
        commonjs: "react",
        commonjs2: "react",
        amd: "react",
        root: "React",
      },
    },
  },
  platform: 'browser'
});
