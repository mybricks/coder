export enum Theme {
  Dark = "vs-dark",
  Light = "light",
}

export const JsxTheme = {
  [Theme.Dark]: {
    "--string-color": "#e37a11",
    "--language-keyword-color": "#619ac3",
    "--global-variable-color": "#fae56e",
    "--local-variable-color": "#fae56e",
    "--unused-opacity": 0.5,
    "--grammar-color": "#369b99",
    "--jsx-tag-color": "#4595ce",
    "--jsx-attribute-color": "#afd5f1",
    "--jsx-text-color": "#efeeee",
    "--jsx-tag-angle-bracket": "#888",
  },
  [Theme.Light]: {
    "--string-color": "#e37a11",
    "--language-keyword-color": "#619ac3",
    "--global-variable-color": "#934d08",
    "--local-variable-color": "#934d08",
    "--unused-opacity": 0.5,
    "--grammar-color": "#369b99",
    "--jsx-tag-color": "#f27b0c",
    "--jsx-attribute-color": "#f94f20",
    "--jsx-text-color": "#333",
    "--jsx-tag-angle-bracket": "#888",
  },
};
