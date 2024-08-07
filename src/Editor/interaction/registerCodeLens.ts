import {
  StandaloneCodeEditor,
  EditorModel,
  EditorCancellationToken,
  CodeLensProvider,
  Monaco,
  InteractionType,
  CodeLens,
  ASTLocation,
  onCommandExecute,
} from "../../types";
import { languages, IEvent } from "monaco-editor";
import { parsePosition } from "./parsePosition";
import { executeChain } from "../../util";

class CopilotCodeLensProvider implements CodeLensProvider {
  private lenses!: CodeLens[];
  public dispose!: () => void;
  constructor(
    private readonly monaco: Monaco,
    private readonly editor: StandaloneCodeEditor,
    private readonly onCommandExecute: onCommandExecute
  ) {
    executeChain([
      () => editor.getModel()?.getValue(),
      parsePosition,
      this.computeRangeValue.bind(this),
      this.createCodeLens.bind(this),
    ]).then(({ codeLens, dispose }: any) => {
      this.lenses = codeLens;
      this.dispose = dispose;
    });
  }
  provideCodeLenses(model: EditorModel, token: EditorCancellationToken) {
    return {
      lenses: this.lenses,
      dispose() {},
    };
  }
  onDidChange?: IEvent<this>;
  resolveCodeLens(
    model: EditorModel,
    codeLens: languages.CodeLens,
    token: EditorCancellationToken
  ) {
    return codeLens;
  }
  private createCodeLens(astLocations: ASTLocation[]) {
    const cacheCommands: Array<() => void> = [];
    const codeLens = astLocations.reduce((pre, loc, index) => {
      const { commands, dispose } = this.registerCommands((key) => {
        this.onCommandExecute(key as keyof typeof InteractionType, loc);
      }, index);
      cacheCommands.push(dispose);
      return pre.concat(
        commands.map((command) => ({
          range: loc.range,
          command,
        }))
      );
    }, [] as any[]);
    return {
      dispose: () => {
        cacheCommands.forEach((dispose) => dispose());
      },
      codeLens,
    };
  }

  private computeRangeValue(astLocations: ASTLocation[]) {
    const model = this.editor.getModel();
    return astLocations.map((loc) => {
      const range = new this.monaco.Range(
        loc.start.line,
        loc.start.column,
        loc.end.line + 1,
        loc.end.column + 1
      );
      const value = model?.getValueInRange(range);
      return {
        ...loc,
        value,
        range,
      };
    });
  }
  private registerCommands(handle: (key: string) => void, index: number) {
    const cacheCommands: Array<() => void> = [];
    const commands = Object.keys(InteractionType).map((key, _) => {
      const commandId = `${key}_${index}`;
      const { dispose } = this.monaco.editor.registerCommand(commandId, () =>
        handle(key)
      );
      cacheCommands.push(dispose);
      return {
        id: commandId,
        title: InteractionType[key as keyof typeof InteractionType],
      };
    });
    return {
      dispose: () => {
        cacheCommands.forEach((dispose) => dispose());
      },
      commands,
    };
  }
}

export const registerCodeLens = (
  monaco: Monaco,
  editor: StandaloneCodeEditor,
  onCommandExecute: onCommandExecute
) => {
  const provider = new CopilotCodeLensProvider(
    monaco,
    editor,
    onCommandExecute
  );
  const disposable = monaco.languages.registerCodeLensProvider(
    "typescript",
    provider
  );
  return () => {
    disposable.dispose();
    provider.dispose();
  };
};
