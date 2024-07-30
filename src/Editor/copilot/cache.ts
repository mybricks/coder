import type {
  EditorModel,
  EditorPosition,
  EditorRange,
  EditorInlineCompletionsResult,
} from "../../types";
import { singleton } from "../../util";

type CacheKey = {
  range: EditorRange;
  textBeforeCursorInline: string;
};

class CompletionCache {
  cache: Map<CacheKey, EditorInlineCompletionsResult>;
  constructor(private readonly maxSize: number) {
    this.cache = new Map<CacheKey, EditorInlineCompletionsResult>();
  }
  private hasCompletion(
    model: EditorModel,
    position: EditorPosition,
    key: CacheKey
  ) {
    let completion;
    for (const [key, value] of this.cache.entries()) {
      const { range, textBeforeCursorInline } = key;
      const valueInRange = model.getValueInRange(range);
      const textBeforeCursorInLine = this.getTextBeforeCursorInLine(
        model,
        position
      );
      const cachedValue = value.items[0].insertText;
      if (
        textBeforeCursorInLine.startsWith(textBeforeCursorInline) &&
        ((range.startLineNumber === position.lineNumber &&
          range.startColumn === position.column) ||
          ((cachedValue as string).startsWith(valueInRange) &&
            range.startLineNumber === position.lineNumber &&
            position.column >= range.startColumn - valueInRange.length &&
            position.column <= range.endColumn))
      ) {
        completion = value;
      }
    }
    if (completion) {
      return completion;
    }
    return false;
  }

  private getTextBeforeCursorInLine(
    model: EditorModel,
    position: EditorPosition
  ) {
    const line = model.getLineContent(position.lineNumber);
    return line.slice(0, position.column - 1);
  }

  public getCompletion(
    model: EditorModel,
    position: EditorPosition,
    key: CacheKey
  ) {
    const completions = this.hasCompletion(model, position, key);
    if (completions) {
      this.cache.delete(key);
      this.cache.set(key, completions);
    }
    return completions;
  }
  public setCompletion(
    key: CacheKey,
    completions: EditorInlineCompletionsResult
  ) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    this.cache.set(key, completions);
    if (this.cache.size >= this.maxSize) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }
  public clear() {
    this.cache.clear();
  }
  private formatKey(key: CacheKey) {
    return {
      ...key,
      textBeforeCursorInline: key.textBeforeCursorInline.replace(
        /(^\s*[\r\n])|(\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$)/gm,
        ""
      ),
    };
  }
}

export default singleton(CompletionCache);
