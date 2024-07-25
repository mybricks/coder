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
} from "../../types";
import { debounce } from "../../util";

class CopilotCompleter implements InlineCompletionProvider {
  constructor(
    private readonly monaco: Monaco,
    private readonly editor: StandaloneCodeEditor,
    private readonly getCompletions: CopilotOptions["getCompletions"]
  ) {
    this.monaco = monaco;
    this.editor = editor;
    this.getCompletions = debounce(getCompletions);
  }
  async provideInlineCompletions(
    model: EditorModel,
    position: EditorPosition,
    context: EditorInlineCompletionContext,
    token: EditorCancellationToken
  ) {
    if (token.isCancellationRequested) {
      // return createInlineCompletionResult([]);
    }
    const completions = await this.getCompletions();
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
          range: new this.monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
        },
      ],
    };
  }
  freeInlineCompletions(completions: EditorInlineCompletionsResult) {
    console.log(completions);
  }
}

export const registerCopilot = (
  monaco: Monaco,
  editor: StandaloneCodeEditor,
  options: CopilotOptions
) => {
  const inlineCompletionsProvider =
    monaco.languages.registerInlineCompletionsProvider(
      options.language,
      new CopilotCompleter(monaco, editor, options.getCompletions)
    );
  return () => {
    inlineCompletionsProvider.dispose();
  };
};
