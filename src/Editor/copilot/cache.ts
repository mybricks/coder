import type { EditorRange } from "../../types";
import { singleton } from "../../util";

type CacheKey = {
  range: EditorRange;
  textBeforeCursorInline: string;
};

class CompletionCache<T extends any> {
  cache: Map<CacheKey, T>;
  constructor(private readonly maxSize: number) {
    this.cache = new Map<CacheKey, T>();
  }
  public getCompletion(key: CacheKey) {
    key = this.formatKey(key);
    const completions = this.cache.get(key);
    if (completions) {
      this.cache.delete(key);
      this.cache.set(key, completions);
    }
    return completions;
  }
  public setCompletion(key: CacheKey, completions: T) {
    key = this.formatKey(key);
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
