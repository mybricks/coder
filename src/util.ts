export function isObject(val: any) {
  return Object.prototype.toString.call(val) === "[object Object]";
}

export const copy = (target: Record<string, any>, hash = new WeakMap()) => {
  if (!isObject(target)) {
    throw TypeError("arguments must be Object");
  }
  if (hash.has(target)) {
    return hash.get(target);
  }
  const ret: Record<string, any> = {};
  for (const key of Object.keys(target)) {
    const val = target[key];
    if (typeof val !== "object" || val === null) {
      ret[key] = val;
    } else if (Array.isArray(val)) {
      ret[key] = [...val];
    } else if (val instanceof Set) {
      ret[key] = new Set([...val]);
    } else if (val instanceof Map) {
      ret[key] = new Map([...val]);
    } else {
      hash.set(val, val);
      ret[key] = copy(val, hash);
    }
  }
  return ret;
};

export function merge<T extends Object>(target: T, source: T): T {
  if (!isObject(target)) return source;
  if (!isObject(source)) return target;
  const targetObject = copy(target);
  const sourceObject = copy(source);
  Object.keys(sourceObject).forEach((key) => {
    const targetValue = targetObject[key];
    const sourceValue = sourceObject[key];
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      targetObject[key] = targetValue.concat(sourceValue);
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      targetObject[key] = merge(targetValue, sourceValue);
    } else {
      targetObject[key] = sourceValue ?? targetObject[key];
    }
  });
  return targetObject;
}

export const safeParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
};

export var versionLog = () => {
  if (process.env.NODE_ENV === "production") {
    console.log(
      `%c${"@mybricks/coder"}`,
      "background: #FA6400;color: #fff;padding: 2px 6px;border-radius: 4px;",
      safeParse(VERSION)
    );
    versionLog = () => {};
  }
};

const removeInjectAMD = () => {
  if ("function" === typeof window.define && window.define.amd) {
    Reflect.deleteProperty(window.define, "amd");
  }
};

export function loadScript(src: string) {
  removeInjectAMD();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.crossOrigin = "anonymous";
    script.onload = (e) => {
      resolve(null);
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export const isFunction = (target: any) => typeof target === "function";

const BabelStandalone = "https://unpkg.com/@babel/standalone/babel.min.js";

export const getBabel = async (babel: string = BabelStandalone) => {
  if (!window.Babel) {
    console.info(
      "%c[Babel was not found in global,loading babel...]",
      "color: orange"
    );
    await loadScript(babel);
  }
  return window.Babel;
};

export const getLinter = async (eslint: string | undefined) => {
  if (!eslint) return;
  if (!window.eslint) {
    await loadScript(eslint);
  }
  const { Linter } = window.eslint;
  return new Linter();
};

export const executeChain = <F extends (...args: any[]) => any>(
  fns: Array<F>
) => {
  return fns.reduce((chain, fn) => chain.then(fn), Promise.resolve());
};

export const debounceAsync = <F extends (...args: any[]) => Promise<any>>(
  fn: F,
  delay: number = 200
) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): Promise<any> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        fn(...args)
          .then(resolve)
          .catch(reject);
      }, delay);
    });
  };
};

export const debounce = <F extends (...args: any[]) => any>(
  fn: F,
  delay: number = 200,
  callback?: (params: ReturnType<F>) => void
) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      const ret = fn(...args);
      callback?.(ret);
    }, delay);
  };
};

export const singleton = <T extends Object>(className: T) => {
  let ins: T;
  return new Proxy(className, {
    construct(target, arg) {
      if (ins) {
        return ins;
      }
      //@ts-ignore
      return (ins = new target(...arg));
    },
  });
};

export const getBody = (request: Request) => {
  return request.body
    ?.getReader()
    .read()
    .then(({ done, value }) => {
      if (done) return;
      const body = JSON.parse(new TextDecoder().decode(value));
      return body;
    });
};

export const getHeaders = (request: Request) => {
  const headers: Record<string, any> = {};
  for (const [key, value] of request.headers.entries()) {
    headers[key] = value;
  }
  return headers;
};

export class Deferred<T extends any> {
  public readonly promise: Promise<T>;
  public resolve!: (value: T) => void;
  public reject!: (err: Event) => void;

  public constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export const clipBoard = (text: string) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    var textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.style.position = "fixed";
    textarea.style.clip = "rect(0 0 0 0)";
    textarea.style.top = "10px";
    textarea.value = text;
    textarea.select();
    document.execCommand("copy", true);
    document.body.removeChild(textarea);
  }
};
