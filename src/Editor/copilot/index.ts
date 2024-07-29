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
  EditorInlineCompletion,
  CbParams,
} from "../../types";
import { debounce } from "../../util";
import {
  createInlineCompletionResult,
  getFileName,
  getCursorTextInAround,
} from "./common";
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
    private readonly onCompletionShow: (params: CbParams) => void
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
    const range = new this.monaco.Range(
      position.lineNumber,
      position.column,
      position.lineNumber,
      position.column
    );
    const { codeBeforeCursor, codeAfterCursor } = getCursorTextInAround(
      model,
      position
    );
    const cache = new CompletionCache<CopilotResult>(10);
    const cacheKey = { range, textBeforeCursorInline: codeBeforeCursor };
    const cachedCompletions = cache.getCompletion(cacheKey);
    if (cachedCompletions?.length) {
      return createInlineCompletionResult(cachedCompletions);
    }
    try {
      const completions = await this.getCompletions({
        codeBeforeCursor,
        codeAfterCursor,
      });

      const format = getFormatter(model, position, range);
      const inlineCompletions = createInlineCompletionResult(
        format(completions ?? [])
      );
      //@ts-ignore
      cache.setCompletion(cacheKey, inlineCompletions);
      return inlineCompletions;
    } catch (error) {
      console.error(error);
      return createInlineCompletionResult([]);
    }
  }
  freeInlineCompletions(completions: EditorInlineCompletionsResult) {
    if(acceptCompletion) return;
    const model = this.editor.getModel();
    const position = this.editor.getPosition();
    const { codeBeforeCursor, codeAfterCursor } = getCursorTextInAround(
      model!,
      position!
    );
    this.options.onFreeCompletion?.({
      codeAfterCursor,
      codeBeforeCursor,
      completion: completions.items[0],
    });
  }
  handleItemDidShow(
    completions: EditorInlineCompletionsResult,
    item: EditorInlineCompletion,
    updatedInsertText: string
  ): void {
    const model = this.editor.getModel();
    const position = this.editor.getPosition();
    const { codeBeforeCursor, codeAfterCursor } = getCursorTextInAround(
      model!,
      position!
    );
    this.onCompletionShow({
      codeBeforeCursor,
      codeAfterCursor,
      completion: item,
    });
  }
}

export const registerCopilot = (
  monaco: Monaco,
  editor: StandaloneCodeEditor,
  options: CopilotOptions
) => {
  let completionShow = false,
    showCompletion!: CbParams;
  const onCompletionShow = (p: CbParams) => {
    completionShow = true;
    showCompletion = p;
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
      options.onAcceptCompletion?.(showCompletion);
    } else {
      acceptCompletion = false;
    }
  });
  return () => {
    inlineCompletionsProvider.dispose();
  };
};
