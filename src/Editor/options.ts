const DefaultEditorOptions = {
  automaticLayout: true,
  detectIndentation: false,
  formatOnType: false,
  lineNumbers: "on",
  scrollbar: { horizontal: "hidden", verticalScrollbarSize: 4 },
  lineNumbersMinChars: 3,
  lineDecorationsWidth: 0,
  minimap: {
    enabled: false,
  },
  fontSize: 16,
  tabSize: 2,
};

export const DefaultCoderOptions = {
  theme: "vs-dark",
  width: "100%",
  height: 500,
  path: "file:///index.tsx",
  options: DefaultEditorOptions,
  loaderConfig: {
    paths: {
      vs: "https://f2.eckwai.com/udata/pkg/eshop/fangzhou/pub/pkg/monaco-editor/0.45.0/min/vs",
    },
  },
  eslint: {
    src: "https://f2.eckwai.com/udata/pkg/eshop/fangzhou/pub/pkg/eslint/8.15.0/eslint.js",
    config: {
      env: {
        browser: true,
        es6: true,
      },
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
      },
    },
  },
};
