import { Monaco } from "@monaco-editor/react";
import type {
  ASTLocation,
  InteractionOptions,
  InteractionType,
  StandaloneCodeEditor,
} from "../../types";
import { debounce } from "../../util";
import { registerCodeLens } from "./registerCodeLens";
import Chat from "./chat";
import { prompts } from "./prompt";
import "./index.css";

export const registerInteraction = (
  monaco: Monaco,
  editor: StandaloneCodeEditor,
  options: InteractionOptions
) => {
  const { duration = 2000 } = options;
  const chat = new Chat(options);
  const onCommandExecute = (
    key: keyof typeof InteractionType,
    loc: ASTLocation
  ) => {
    chat.fetchChats({
      messages: [
        { role: "user", content: loc.value },
        { role: "user", content: prompts[key].content },
      ],
    });
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
  return () => {
    dispose();
    subscription.dispose();
  };
};
