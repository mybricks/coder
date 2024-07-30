import {
  type EditorModel,
  EditorPosition,
  EditorRange,
  CopilotResult,
} from "../../types";
class FormatterCompletion {
  private originalCompletion!: string;
  private formattedCompletion!: string;
  constructor(
    private readonly model: EditorModel,
    private readonly position: EditorPosition,
    private readonly range: EditorRange
  ) {}
  private ignoreBlankLines() {
    if (
      this.formattedCompletion.trimStart() === "" &&
      this.originalCompletion !== "\n"
    ) {
      this.formattedCompletion = this.formattedCompletion.trim();
    }
    return this;
  }

  private removeInvalidLineBreaks() {
    this.formattedCompletion = this.formattedCompletion.trimEnd();
    return this;
  }

  private trimStart(): this {
    const firstNonSpaceIndex = this.formattedCompletion.search(/\S/);
    if (firstNonSpaceIndex > this.position.column - 1) {
      this.formattedCompletion =
        this.formattedCompletion.slice(firstNonSpaceIndex);
    }
    return this;
  }

  public computeRange() {
    const lineCount = (this.formattedCompletion.match(/\n/g) || []).length;
    const lastLineColumnCount = this.getLastLineColumnCount();
    const charAfterCursor = this.getCharAfterCursor();
    return {
      startLineNumber: this.position.lineNumber,
      startColumn: this.position.column,
      endLineNumber: this.position.lineNumber + lineCount,
      endColumn: !this.formattedCompletion.includes(charAfterCursor)
        ? this.position.column
        : this.position.lineNumber === this.range.startLineNumber &&
          lineCount === 0
        ? this.position.column + lastLineColumnCount
        : lastLineColumnCount,
    };
  }

  private getCharAfterCursor() {
    const line = this.model.getLineContent(this.position.lineNumber);
    return line[this.position.column - 1];
  }

  private getLastLineColumnCount() {
    const lines = this.formattedCompletion.split("\n");
    return lines[lines.length - 1].length;
  }

  public format(code: string) {
    this.formattedCompletion = code;
    this.originalCompletion = code;
    this.ignoreBlankLines().removeInvalidLineBreaks().trimStart();
    return this.formattedCompletion;
  }
}

export const getFormatter = (
  model: EditorModel,
  position: EditorPosition,
  range: EditorRange
) => {
  const formatter = new FormatterCompletion(model, position, range);
  return (completions: CopilotResult) => {
    return completions.map((it) => ({
      insertText: formatter.format(it.code),
      range,
    }));
  };
};
