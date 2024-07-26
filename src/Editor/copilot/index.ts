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
} from "../../types";
import { debounce } from "../../util";
import { createInlineCompletionResult } from "./common";
import { languages } from "monaco-editor";

let acceptCompletion = false;

class CopilotCompleter implements InlineCompletionProvider {
  getCompletions: (args: {
    codeBeforeCursor: string;
  }) => Promise<CopilotResult>;
  private controller!: AbortController | null;
  constructor(
    private readonly monaco: Monaco,
    private readonly editor: StandaloneCodeEditor,
    private readonly request: CopilotOptions["request"],
    private readonly onCompletionShow: (
      item: languages.InlineCompletion
    ) => void
  ) {
    this.getCompletions = debounce(
      ({
        codeBeforeCursor,
        codeAfterCursor,
      }: Partial<{ codeBeforeCursor: string; codeAfterCursor: string }>) => {
        if (this.controller) {
          this.controller.abort();
        }
        this.controller = new AbortController();
        return fetch(request.url, {
          ...request,
          signal: this.controller.signal,
          body: JSON.stringify({
            path: "index.ts",
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
          .catch((err) => {
            console.error(err);
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
    const text = model.getValue();
    const range = new this.monaco.Range(
      position.lineNumber,
      position.column,
      position.lineNumber,
      position.column
    );
    const completions = await this.getCompletions({ codeBeforeCursor: text });
    console.log("---------", completions);
    return {
      items: [
        {
          insertText: {
            snippet: `export const getServerSideProps = async () => {
            console.log("Dashboard getServerSideProps");
            return {
              props: {},
            };
          };`,
          },
          range,
        },
      ],
    };
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
      new CopilotCompleter(monaco, editor, options.request, onCompletionShow)
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
