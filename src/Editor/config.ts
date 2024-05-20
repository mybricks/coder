import type { Monaco } from "@monaco-editor/react";

export enum Language {
  Javascript = "javascript",
  Typescript = "typescript",
}

const ConfigMap = {
  [Language.Javascript]: (monaco: Monaco) => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES6,
      allowNonTsExtensions: true,
      noImplicitAny: true,
      strict: true,
    });
  },
  [Language.Typescript]: (monaco: Monaco, isTsx?: boolean) => {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: !!isTsx || false,
      noSyntaxValidation: false,
    });
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES6,
      allowNonTsExtensions: true,
      noImplicitAny: false,
      strict: false,
      noLib: false,
      jsx: isTsx
        ? monaco.languages.typescript.JsxEmit.ReactJsx
        : monaco.languages.typescript.JsxEmit.None,
      lib: ["es2020", "dom", "DOM.Iterable"],
      module: monaco.languages.typescript.ModuleKind.ESNext,
      skipLibCheck: true,
      esModuleInterop: true,
      noEmit: false,
      jsxFactory: "React.createElement",
      reactNamespace: "React",
      declaration: true,
    });
  },
};

export const getConfigSetter = (language: Language) => {
  return ConfigMap[language] ?? (() => {});
};

const TransformOptions = {
  [Language.Javascript]: () => {
    return {
      presets: ["env"],
      comments: false,
    };
  },
  [Language.Typescript]: (isTsx?: boolean) => {
    return !!isTsx
      ? {
          presets: ["env", "react"],
          parserOpts: { strictMode: false },
          plugins: [
            ["proposal-decorators", { legacy: true }],
            "proposal-class-properties",
            [
              "transform-typescript",
              {
                isTSX: true,
              },
            ],
          ],
        }
      : {
          presets: ["env", "typescript"],
          parserOpts: { strictMode: false },
          comments: false,
          filename: "types.d.ts",
        };
  },
};

export const getTransformOptions = (language: Language) => {
  return TransformOptions[language] ?? (() => {});
};
