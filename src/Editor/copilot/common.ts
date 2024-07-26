import {
  EditorInlineCompletion,
  EditorInlineCompletionsResult,
} from "../../types";

export const createInlineCompletionResult = (
  items: EditorInlineCompletion[]
): EditorInlineCompletionsResult => {
  return {
    items,
    enableForwardStability: true,
  };
};
