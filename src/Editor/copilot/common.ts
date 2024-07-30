import {
  EditorInlineCompletion,
  EditorInlineCompletionsResult,
  EditorModel,
  EditorPosition,
  LanguageMapToSuffix,
  LanguageType,
} from "../../types";

export const createInlineCompletionResult = (
  items: EditorInlineCompletion[]
): EditorInlineCompletionsResult => {
  return {
    items,
    enableForwardStability: true,
  };
};

export const getCursorTextInAround = (
  model: EditorModel,
  position: EditorPosition
) => {
  const codeBeforeCursor = model.getValueInRange({
    startLineNumber: 1,
    startColumn: 1,
    endLineNumber: position.lineNumber,
    endColumn: position.column,
  });
  const codeAfterCursor = model.getValueInRange({
    startLineNumber: position.lineNumber,
    startColumn: position.column,
    endLineNumber: model.getLineCount(),
    endColumn: model.getLineMaxColumn(model.getLineCount()),
  });
  return {
    codeBeforeCursor,
    codeAfterCursor,
  };
};

export const getFileName = (language: LanguageType) => {
  return `index${
    LanguageMapToSuffix[language.toLocaleLowerCase() as LanguageType]
  }`;
};

export const isValidCompletions = (
  completions: EditorInlineCompletionsResult
) => {
  if (completions.items.length === 0) return false;
  if (!completions.items[0].insertText) return false;
  return true;
};
