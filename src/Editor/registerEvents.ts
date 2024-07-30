import type { StandaloneCodeEditor } from "../types";
type EditorEvent = {
  name: "onDidFocusEditorText" | "onDidBlurEditorText";
  callback: () => void;
};
export type Handle = {
  dispose(): void;
};
export const registerEvents = (
  editor: StandaloneCodeEditor,
  events: Array<EditorEvent>,
  handles: Array<Handle>
) => {
  if (handles.length) {
    handles.forEach((handle) => handle.dispose());
  }
  events.forEach(({ name, callback }) => {
    handles.push(editor[name](callback));
  });
  return handles;
};
