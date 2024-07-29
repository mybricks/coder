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
    const completion = this.cache.get(key);
    if (completion) {
      this.cache.delete(key);
      this.cache.set(key, completion);
    }
    return completion;
  }
  public setCompletion(key: CacheKey, completion: T) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    this.cache.set(key, completion);
    if (this.cache.size >= this.maxSize) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }
  public clear() {
    this.cache.clear();
  }
}

export default singleton(CompletionCache);
