import { defineConfig } from "father";

export default defineConfig({
  define: {
    VERSION: JSON.stringify(process.env.npm_package_version),
  },
  esm: {},
  cjs: {
    output: 'dist/lib'
  },
  // umd: {
  //   name: "Editor",
  //   output: {
  //     filename: "index.js",
  //   },
  //   externals: {
  //     react: {
  //       commonjs: "react",
  //       commonjs2: "react",
  //       amd: "react",
  //       root: "React",
  //     },
  //     "react-dom": {
  //       commonjs: "react-dom",
  //       commonjs2: "react-dom",
  //       amd: "react-dom",
  //       root: "ReactDOM",
  //     },
  //   },
  // },
  platform: 'browser'
});
