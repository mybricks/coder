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
import { debounceAsync, getBody } from "../../util";
import {
  createInlineCompletionResult,
  getFileName,
  getCursorTextInAround,
  isValidCompletions,
} from "./common";
import { getFormatter } from "./format";
import CompletionCache from "./cache";

let acceptCompletion = false;

class CopilotCompleter implements InlineCompletionProvider {
  fetchCompletions: (args: CopilotParams) => Promise<CopilotResult>;
  private body!: Record<string, any>;
  private controller!: AbortController | null;
  private uniqueUri!: string;
  constructor(
    private readonly monaco: Monaco,
    private readonly editor: StandaloneCodeEditor,
    private readonly options: CopilotOptions,
    private readonly onCompletionShow: (params: CbParams) => void
  ) {
    this.uniqueUri = editor.getModel()?.uri.toString() ?? "";
    const path = getFileName(options.language);
    const getCompletions =
      options.getCompletions ??
      (async (res) => {
        if (res.ok) {
          const { data: completions } = await res.json();
          return completions;
        }
        throw Error(res.statusText);
      });
    this.fetchCompletions = debounceAsync(
      async ({ codeBeforeCursor, codeAfterCursor }: CopilotParams) => {
        const body = this.body ?? (await getBody(options.request)) ?? {};
        this.body = body;
        if (this.controller) {
          this.controller.abort();
        }
        this.controller = new AbortController();
        return fetch(options.request, {
          signal: this.controller.signal,
          body: JSON.stringify({
            path,
            codeBeforeCursor,
            codeAfterCursor,
            stream: false,
            ...body,
          }),
        })
          .then(getCompletions)
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
    const uri = model.uri.toString();
    if(this.uniqueUri!== uri) return;
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
    try {
      const completions = await this.fetchCompletions({
        codeBeforeCursor,
        codeAfterCursor,
      });

      const format = getFormatter(model, position, range);
      const inlineCompletions = createInlineCompletionResult(
        format(completions ?? [])
      );
      return inlineCompletions;
    } catch (error) {
      console.error(error);
      return createInlineCompletionResult([]);
    }
  }
  freeInlineCompletions(completions: EditorInlineCompletionsResult) {
    if (acceptCompletion || !isValidCompletions(completions)) return;
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
  const subscription = editor.onKeyDown((e) => {
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
    subscription.dispose();
  };
};
