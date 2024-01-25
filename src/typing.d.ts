declare interface Window {
  Babel: any;
  define: any;
  eslint: {
    Linter: class;
    [k: string]: any;
  };
}
