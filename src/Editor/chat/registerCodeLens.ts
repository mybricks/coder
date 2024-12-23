import type {
  StandaloneCodeEditor,
  EditorModel,
  EditorCancellationToken,
  CodeLensProvider,
  Monaco,
  CodeLens,
  ASTLocation,
  onCommandExecute,
  IDisposable,
} from "../../types";
import { ChatType } from "../../types";
import { languages, IEvent } from "monaco-editor";
import { parsePosition } from "./parsePosition";
import { executeChain, Deferred } from "../../util";

class CopilotCodeLensProvider implements CodeLensProvider {
  private lenses: CodeLens[] = [];
  public dispose: () => Promise<void> = () => Promise.resolve();
  private uniqueUri!: string;
  private deferred: Deferred<boolean> = new Deferred();
  constructor(
    private readonly monaco: Monaco,
    private readonly editor: StandaloneCodeEditor,
    private readonly onCommandExecute: onCommandExecute
  ) {
    this.uniqueUri = editor.getModel()?.uri.toString() ?? "";
    executeChain([
      () => editor.getModel()?.getValue(),
      parsePosition,
      this.computeRangeValue.bind(this),
      this.createCodeLens.bind(this),
    ])
      .then(({ lenses, dispose }: any) => {
        this.lenses = lenses;
        this.dispose = dispose;
      })
      .catch((err) => {
        this.lenses = [];
        this.dispose = () => Promise.resolve();
      })
      .finally(() => {
        this.deferred.resolve(true);
      });
  }
  async provideCodeLenses(model: EditorModel, token: EditorCancellationToken) {
    const uri = model.uri.toString();
    const dispose = () => {};
    if (this.uniqueUri !== uri) {
      return {
        lenses: [],
        dispose,
      };
    }
    await this.deferred.promise;
    return {
      lenses: this.lenses,
      dispose,
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
    const lenses = astLocations.reduce((pre, loc) => {
      const { commands, dispose } = this.registerCommands(loc, (key) => {
        this.onCommandExecute(key as keyof typeof ChatType, loc);
      });
      cacheCommands.push(dispose);
      return pre.concat(
        commands.map((command) => ({
          range: loc.range,
          command,
          id: command.id
        }))
      );
    }, [] as any[]);
    return {
      dispose: () => Promise.all(cacheCommands.map((dispose) => dispose())),
      lenses,
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
  private registerCommands(loc: ASTLocation, handle: (key: string) => void) {
    const cacheCommands: Array<() => void> = [];
    const commands = Object.keys(ChatType).map((key, _) => {
      const commandId = `${loc.identifierName}_${key}`;
      const { dispose } = this.monaco.editor.registerCommand(commandId, () =>
        handle(key)
      );
      cacheCommands.push(dispose);
      return {
        id: commandId,
        title: ChatType[key as keyof typeof ChatType],
      };
    });
    return {
      dispose: () => Promise.all(cacheCommands.map((dispose) => dispose())),
      commands,
    };
  }
}

let provider: CopilotCodeLensProvider, disposable: IDisposable;

export const registerCodeLens = async (
  monaco: Monaco,
  editor: StandaloneCodeEditor,
  onCommandExecute: onCommandExecute
) => {
  if (disposable) disposable.dispose();
  if (provider) await provider.dispose();
  provider = new CopilotCodeLensProvider(monaco, editor, onCommandExecute);
  disposable = monaco.languages.registerCodeLensProvider(
    "typescript",
    provider
  );
};
