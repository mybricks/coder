import { Monaco } from "@monaco-editor/react";
import type {
  ASTLocation,
  ChatOptions,
  ChatType,
  StandaloneCodeEditor,
} from "../../types";
import { debounce, Deferred } from "../../util";
import { registerCodeLens } from "./registerCodeLens";
import Chat from "./render";
import { createPrompts } from "./prompt";
import "./index.css";

const getCode = (editor: StandaloneCodeEditor) => {
  const model = editor.getModel();
  const lines = model?.getLineCount();
  const value = model?.getValue();
  return {
    lines,
    value: value?.trim(),
  };
};

export const registerChat = (
  monaco: Monaco,
  editor: StandaloneCodeEditor,
  options: ChatOptions
) => {
  const { duration = 200 } = options;
  const path = editor.getModel()?.uri.toString();
  const insDom = document.querySelector(
    `div[data-uri="${path}"]`
  ) as HTMLElement;
  const chat = new Chat(options);
  let deferred = new Deferred<boolean>();
  let { lines: lastLines, value: lastValue } = getCode(editor);
  const onCommandExecute = (key: keyof typeof ChatType, loc: ASTLocation) => {
    chat.chatType = key;
    chat.prompts = createPrompts(key, loc);
    deferred.resolve(true);
  };

  const insClickHandler = async (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const widgetId = target.parentElement!.getAttribute("widgetid");
    if (widgetId?.startsWith("codelens.widget")) {
      await deferred.promise;
      deferred = new Deferred<boolean>();
      const rect = target.getBoundingClientRect();
      chat.render(rect);
    }
  };

  registerCodeLens(monaco, editor, onCommandExecute);
  const delayRegister = debounce(registerCodeLens, duration);
  const subscription = editor.onDidChangeModelContent(async (e) => {
    const { lines, value } = getCode(editor);
    if (lines === lastLines || lastValue === value) return;
    lastLines = lines;
    lastValue = value;
    delayRegister(monaco, editor, onCommandExecute);
  });
  insDom?.addEventListener("click", insClickHandler);
  return () => {
    subscription.dispose();
    insDom?.removeEventListener("click", insClickHandler);
    chat.dispose();
  };
};
