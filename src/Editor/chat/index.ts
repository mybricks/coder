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

export const registerChat = (
  monaco: Monaco,
  editor: StandaloneCodeEditor,
  options: ChatOptions
) => {
  const { duration = 300 } = options;
  const path = editor.getModel()?.uri.toString();
  const insDom = document.querySelector(
    `div[data-uri="${path}"]`
  ) as HTMLElement;
  const chat = new Chat(options);
  let deferred = new Deferred<boolean>();
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
  const delayRegister = debounce(registerCodeLens, duration);
  delayRegister(monaco, editor, onCommandExecute);
  const subscription = editor.onDidChangeModelContent(() => {
    delayRegister(monaco, editor, onCommandExecute);
  });
  insDom?.addEventListener("click", insClickHandler);
  return () => {
    subscription.dispose();
    insDom?.removeEventListener("click", insClickHandler);
    chat.dispose();
  };
};
