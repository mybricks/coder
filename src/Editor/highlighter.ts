import type { Monaco } from "@monaco-editor/react";
import type { StandaloneCodeEditor } from "../types";
import {
  MonacoJsxSyntaxHighlight,
  getWorker,
} from "monaco-jsx-syntax-highlight";

export const setJsxHighlight = (editor: StandaloneCodeEditor, monaco: Monaco) => {
  const monacoJsxSyntaxHighlight = new MonacoJsxSyntaxHighlight(
    getWorker(),
    monaco
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
