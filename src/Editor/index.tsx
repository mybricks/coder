import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useState,
} from "react";
import { loader, Editor, EditorProps, useMonaco } from "@monaco-editor/react";
import { getConfigSetter, Language, getTransformOptions } from "./config";
import { setJsxHighlight } from "./highlighter";
import { DefaultCoderOptions } from "./options";
import { merge, getLinter, getBabel, versionLog } from "../util";
import type { TransformOptions } from "@babel/core";
import { registerEvents, Handle } from "./registerEvents";
import type {
  StandaloneCodeEditor,
  ModelContentChangedEvent,
  Diagnostic,
  Monaco,
  EmitOutput,
} from "../types";
import { JsxTheme, Theme } from "./jsxTheme";
import "./index.css";
import { registerCopilot } from "./copilot";

export interface CoderProps extends EditorProps {
  extraLib?: string;
  isTsx?: boolean;
  loaderConfig?: {
    paths?: {
      vs?: string;
    };
  };
  eslint?: {
    src?: string;
    config?: Record<string, any>;
  };
  babel?: {
    standalone?: string;
    options?: TransformOptions;
  };
  onBlur?: (editor: StandaloneCodeEditor) => void;
  onFocus?: (editor: StandaloneCodeEditor) => void;
}

export type HandlerType = {
  monaco: Monaco | null;
  editor: StandaloneCodeEditor;
  format(): void;
  compile(value?: string, options?: TransformOptions): Promise<string>;
  transform(
    options?: Partial<{ ignores: string[]; semantic: boolean }>
  ): Promise<EmitOutput["outputFiles"] | Diagnostic[]>;
  getSemanticDiagnostics(): Promise<Diagnostic[]>;
};

const Coder = forwardRef<HandlerType, CoderProps>((props: CoderProps, ref) => {
  //@ts-ignore
  const _props = merge<CoderProps>(DefaultCoderOptions, props);
  const {
    extraLib,
    language,
    defaultLanguage,
    isTsx,
    loaderConfig,
    eslint,
    theme,
    babel,
    path,
  } = _props;
  const lang = language ?? defaultLanguage;

  const [isMounted, setMounted] = useState<boolean>(false);
  const editorRef = useRef<StandaloneCodeEditor>();
  const eventListenRef = useRef<Array<Handle>>([]);
  const monaco = useMonaco();
  const linterRef = useRef<any>();
  const themeTagRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      monaco,
      editor: editorRef.current!,
      format() {
        editorRef.current!.getAction("editor.action.formatDocument")!.run();
      },
      async compile(value?: string, options?: TransformOptions) {
        value = value ?? editorRef.current!.getValue();
        if (
          !value ||
          ![Language.Javascript, Language.Typescript].includes(
            lang as Language
          ) ||
          !!_props.options!.readOnly
        )
          return value;
        try {
          const babelIns = await getBabel(babel?.standalone);
          const getDefaultOptions = getTransformOptions(lang as Language);
          const defaultOptions = getDefaultOptions(isTsx);
          const { code } = babelIns.transform(
            value,
            babel?.options ?? options ?? defaultOptions
          );
          return code;
        } catch (error) {
          throw error;
        }
      },
      async transform(
        options?: Partial<{ ignores: string[]; semantic: boolean }>
      ) {
        if (
          !editorRef.current ||
          !monaco ||
          (lang !== "javascript" && lang !== "typescript")
        )
          return [];
        const { ignores = [], semantic } = options ?? {};
        const model = editorRef.current.getModel();
        const uri = model!.uri.toString();
        const client = await getWorkerService();
        if (semantic) {
          const semantics = (await client.getSemanticDiagnostics(uri)).filter(
            (it: any) => !ignores.some((key) => it.messageText.includes(key))
          );
          if (semantics.length) {
            return Promise.reject(semantics);
          }
        }
        return (await client.getEmitOutput(uri)).outputFiles;
      },
      async getSemanticDiagnostics() {
        if (!editorRef.current || !monaco) return [];
        const client = await getWorkerService();
        const model = editorRef.current.getModel();
        const uri = model!.uri.toString();
        const semantics = await client.getSemanticDiagnostics(uri);
        return semantics;
      },
    }),
    [monaco, lang, isMounted, _props, editorRef.current]
  );

  const getWorkerService = useCallback(async () => {
    const worker = monaco!.languages.typescript.getTypeScriptWorker;
    const serviceWorker = await worker();
    const client = await serviceWorker();
    return client;
  }, [monaco, lang, editorRef.current]);

  useLayoutEffect(() => {
    if (loaderConfig) {
      loader.config(loaderConfig);
    }
  }, [loaderConfig]);

  versionLog();

  // useEffect(() => {
  //   if (!monaco || !editorRef.current) return;
  //   const dispose = registerCopilot(monaco, editorRef.current, { language: lang });
  //   return () => {
  //     dispose();
  //   };
  // }, [monaco, editorRef.current, lang]);

  useEffect(() => {
    if (
      ![Language.Javascript, Language.Typescript].includes(lang as Language) ||
      !monaco
    )
      return;
    const setCompilerOptions = getConfigSetter(lang as Language);
    setCompilerOptions(monaco, isTsx);
    const libUri = "ts:filename/facts.d.ts";
    if (extraLib) {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        extraLib,
        libUri
      );
    }
  }, [monaco, extraLib, lang, isTsx]);

  useEffect(() => {
    if (!monaco || !isMounted || !isTsx) return;
    const highLightHandler = setJsxHighlight(editorRef.current!, monaco);
    return () => {
      typeof highLightHandler === "function" && highLightHandler();
    };
  }, [monaco, isTsx, isMounted]);

  useEffect(() => {
    const goal = themeTagRef.current!.nextElementSibling!.querySelector(
      ".jsx-editor"
    ) as HTMLElement;
    const themeVariable = JsxTheme[theme as Theme];
    if (!goal || !themeVariable) return;
    for (const [key, value] of Object.entries(themeVariable)) {
      goal.style.setProperty(key, value as string);
    }
  }, [theme]);

  const onMount = (editor: StandaloneCodeEditor, monaco: Monaco) => {
    setMounted(true);
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const value = editor.getValue();
      onChange(value, null);
    });
    eventListenRef.current = registerEvents(
      editor,
      [
        {
          name: "onDidFocusEditorText",
          callback() {
            onDidFocusEditorText(editor);
          },
        },
        {
          name: "onDidBlurEditorText",
          callback() {
            onDidBlurEditorText(editor);
          },
        },
      ],
      eventListenRef.current
    );
    typeof _props.onMount === "function" && _props.onMount(editor, monaco);
    queueMicrotask(() => {
      getLinter(eslint?.src).then((linter) => {
        linterRef.current = linter;
        markerEditor(editor.getValue());
      });
    });
  };

  const markerEditor = useCallback(
    (value: string | undefined) => {
      if (monaco && editorRef.current && linterRef.current && value) {
        if (lang === Language.Javascript) {
          const model = editorRef.current.getModel();
          const markers = linterRef.current
            .verify(value, {
              env: {
                browser: true,
                es6: true,
              },
              parserOptions: {
                ecmaVersion: 2018,
                ecmaFeatures: {
                  jsx: true,
                },
                sourceType: "module",
              },
              ...eslint?.config,
            })
            .map(({ line, column, message }: any) => ({
              startLineNumber: line,
              endLineNumber: line,
              startColumn: column,
              endColumn: column,
              message: `${message}`,
              severity: 3,
            }));
          monaco.editor.setModelMarkers(model!, "ESlint", markers);
        }
      }
    },
    [isMounted, eslint, monaco, lang]
  );

  const onDidFocusEditorText = useCallback(
    (editor: StandaloneCodeEditor) => {
      typeof _props.onFocus === "function" && _props.onFocus(editor);
    },
    [_props.onFocus]
  );

  const onDidBlurEditorText = useCallback(
    (editor: StandaloneCodeEditor) => {
      typeof _props.onBlur === "function" && _props.onBlur(editor);
    },
    [_props.onBlur]
  );

  const onChange = useCallback(
    (value: string | undefined, e: ModelContentChangedEvent | null) => {
      markerEditor(value);
      typeof _props.onChange === "function" && _props.onChange(value, e!);
    },
    [_props.onChange]
  );

  return (
    <>
      <div data-element-type="themeTag" ref={themeTagRef} />
      <Editor
        {..._props}
        onMount={onMount}
        onChange={onChange}
        className={`${_props.className ?? ""} ${isTsx ? "jsx-editor" : ""}`}
      />
    </>
  );
});

export { Coder, type StandaloneCodeEditor as editor, Theme, useMonaco };
