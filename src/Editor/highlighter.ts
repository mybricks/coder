import type { Monaco } from "@monaco-editor/react";
import {
  MonacoJsxSyntaxHighlight,
  getWorker,
} from "monaco-jsx-syntax-highlight";

export const setJsxHighlight = (editor: any, monaco: Monaco) => {
  const monacoJsxSyntaxHighlight = new MonacoJsxSyntaxHighlight(
    getWorker(),
    monaco
  );
  const { highlighter, dispose } = monacoJsxSyntaxHighlight.highlighterBuilder({
    editor: editor,
  });
  highlighter();

  editor.onDidChangeModelContent(() => {
    highlighter();
  });

  return dispose;
};
