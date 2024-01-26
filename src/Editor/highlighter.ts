import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-types";
import {
  MonacoJsxSyntaxHighlight,
  getWorker,
} from "monaco-jsx-syntax-highlight";

export const setJsxHighlight = (editor: editor, monaco: Monaco) => {
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
