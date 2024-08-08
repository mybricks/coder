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
import { prompts } from "./prompt";
import "./index.css";

export const registerInteraction = (
  monaco: Monaco,
  editor: StandaloneCodeEditor,
  options: ChatOptions
) => {
  const { duration = 2000, path } = options;
  const insDom = document.querySelector(
    `div[data-uri="file:\/\/\/${path}"]`
  ) as HTMLElement;
  const chat = new Chat(options);
  const deferred = new Deferred<boolean>();
  const onCommandExecute = (key: keyof typeof ChatType, loc: ASTLocation) => {
    chat.chatType = key;
    chat.prompts = [
      { role: "user", content: loc.value },
      { role: "user", content: prompts[key].content },
    ];
    deferred.resolve(true);
  };

  const insClickHandler = async (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const widgetId = target.parentElement!.getAttribute("widgetid");
    if (widgetId?.startsWith("codelens.widget")) {
      await deferred.promise;
      const rect = target.getBoundingClientRect();
      chat.render(rect);
    }
  };

  let dispose = registerCodeLens(monaco, editor, onCommandExecute);
  const delayRegister = debounce(
    registerCodeLens,
    duration,
    (disposeCodeLens) => {
      dispose = disposeCodeLens;
    }
  );
  const subscription = editor.onDidChangeModelContent(() => {
    if (dispose) {
      dispose();
    }
    delayRegister(monaco, editor, onCommandExecute);
  });
  insDom?.addEventListener("click", insClickHandler);
  return () => {
    dispose();
    subscription.dispose();
    insDom?.removeEventListener("click", insClickHandler);
  };
};
