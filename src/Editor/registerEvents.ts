import type { StandaloneCodeEditor } from "../types";
type EditorEvent = {
  name: string;
  callback: (e: Event) => void;
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
