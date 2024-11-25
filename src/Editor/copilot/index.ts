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
import { debounceAsync, getBody, Deferred } from "../../util";
import {
  createInlineCompletionResult,
  getFileName,
  getCursorTextInAround,
  isValidCompletions,
} from "./common";
import { getFormatter } from "./format";
import { SingleCompletionCache, SingleCompletionLRU } from "./cache";

let acceptCompletion = false;
const completionLRU = new SingleCompletionLRU(10);

class CopilotCompleter implements InlineCompletionProvider {
  fetchCompletions: (args: CopilotParams) => Promise<CopilotResult>;
  private request!: Request;
  private body!: Record<string, any>;
  private controller!: AbortController | null;
  private uniqueUri!: string;
  private requestDuration!: number;
  constructor(
    private readonly monaco: Monaco,
    private readonly editor: StandaloneCodeEditor,
    private readonly options: CopilotOptions,
    private readonly onCompletionShow: (params: CbParams) => void
  ) {
    this.uniqueUri = editor.getModel()?.uri.toString() ?? "";
    this.request = new Request(options.request);
    const deferred = new Deferred<boolean>();
    (async () => {
      this.body = await getBody(this.request.clone())?.finally(() => {
        deferred.resolve(true);
      });
    })();
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
        await deferred.promise;
        if (this.controller) {
          this.controller.abort();
        }
        this.controller = new AbortController();
        const requestStart = Date.now();
        return fetch(this.request.clone(), {
          signal: this.controller.signal,
          body: JSON.stringify({
            path,
            codeBeforeCursor,
            codeAfterCursor,
            stream: false,
            ...(this.body ?? {}),
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
            this.requestDuration = Date.now() - requestStart;
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
    if (this.uniqueUri !== uri) return;
    if (token.isCancellationRequested) {
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
    const insertText = completions.items![0]?.insertText;
    if (
      acceptCompletion ||
      !isValidCompletions(completions) ||
      completionLRU.get(insertText)
    )
      return;
    completionLRU.set(insertText, insertText);
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
      duration: this.requestDuration,
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
      duration: this.requestDuration,
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
