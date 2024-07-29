import { Monaco } from "@monaco-editor/react";
import type {
  StandaloneCodeEditor,
  InlineCompletionProvider,
  EditorModel,
  EditorPosition,
  EditorInlineCompletionContext,
  EditorCancellationToken,
  EditorInlineCompletionsResult,
  CopilotOptions,
  CopilotResult,
  CopilotParams,
} from "../../types";
import { debounce } from "../../util";
import {
  createInlineCompletionResult,
  getFileName,
  getCursorTextInAround,
} from "./common";
import { languages } from "monaco-editor";
import { getFormatter } from "./format";
import CompletionCache from "./cache";

let acceptCompletion = false;

class CopilotCompleter implements InlineCompletionProvider {
  getCompletions: (args: CopilotParams) => Promise<CopilotResult>;
  private controller!: AbortController | null;
  constructor(
    private readonly monaco: Monaco,
    private readonly editor: StandaloneCodeEditor,
    private readonly options: CopilotOptions,
    private readonly onCompletionShow: (
      item: languages.InlineCompletion
    ) => void
  ) {
    this.getCompletions = debounce(
      ({ codeBeforeCursor, codeAfterCursor }: CopilotParams) => {
        if (this.controller) {
          this.controller.abort();
        }
        this.controller = new AbortController();
        return fetch(options.request, {
          signal: this.controller.signal,
          body: JSON.stringify({
            path: getFileName(options.language),
            codeBeforeCursor,
            codeAfterCursor,
            stream: false,
          }),
        })
          .then(async (res) => {
            if (res.ok) {
              const { data: completions } = await res.json();
              return completions;
            }
            throw Error(res.statusText);
          })
          .catch((error) => {
            if (error.name !== "AbortError") {
              console.error(error);
            }
          })
          .finally(() => {
            this.controller = null;
          });
      }
    );
  }
  async provideInlineCompletions(
    model: EditorModel,
    position: EditorPosition,
    context: EditorInlineCompletionContext,
    token: EditorCancellationToken
  ) {
    if (token.isCancellationRequested || acceptCompletion) {
      return createInlineCompletionResult([]);
    }
    try {
      const { codeBeforeCursor, codeAfterCursor } = getCursorTextInAround(
        model,
        position
      );
      const completions = await this.getCompletions({
        codeBeforeCursor,
        codeAfterCursor,
      });
      const range = new this.monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column
      );
      const format = getFormatter(model, position, range);
      const result = createInlineCompletionResult(format(completions ?? []));
      console.log("------result------", result);
      return result;
    } catch (error) {
      console.error(error);
      return createInlineCompletionResult([]);
    }
  }
  freeInlineCompletions(completions: EditorInlineCompletionsResult) {
    // console.log(completions);
  }
  handleItemDidShow(
    completions: languages.InlineCompletions<languages.InlineCompletion>,
    item: languages.InlineCompletion,
    updatedInsertText: string
  ): void {
    this.onCompletionShow(item);
  }
}

export const registerCopilot = (
  monaco: Monaco,
  editor: StandaloneCodeEditor,
  options: CopilotOptions
) => {
  let completionShow = false;
  const onCompletionShow = (item: languages.InlineCompletion) => {
    completionShow = true;
  };
  const inlineCompletionsProvider =
    monaco.languages.registerInlineCompletionsProvider(
      options.language,
      new CopilotCompleter(monaco, editor, options, onCompletionShow)
    );
  editor.onKeyDown((e) => {
    if (
      completionShow &&
      (e.keyCode === monaco.KeyCode.Tab ||
        (e.keyCode === monaco.KeyCode.RightArrow && e.metaKey))
    ) {
      completionShow = false;
      acceptCompletion = true;
    } else {
      acceptCompletion = false;
    }
  });
  return () => {
    inlineCompletionsProvider.dispose();
  };
};
