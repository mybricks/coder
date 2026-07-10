import type { Monaco } from "@monaco-editor/react";
import type { StandaloneCodeEditor } from "../types";
import {
  MonacoJsxSyntaxHighlight,
  getWorker,
  type Config,
} from "monaco-jsx-syntax-highlight";

export const setJsxHighlight = (
  editor: StandaloneCodeEditor,
  monaco: Monaco,
  config?: Config
) => {
  const monacoJsxSyntaxHighlight = new MonacoJsxSyntaxHighlight(
    getWorker(),
    monaco,
    config
  );
  const { highlighter, dispose } = monacoJsxSyntaxHighlight.highlighterBuilder({
    editor,
  });
  highlighter();

  editor.onDidChangeModelContent(() => {
    highlighter();
  });

  return dispose;
};
