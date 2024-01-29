import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useState,
} from "react";
import {
  loader,
  Editor,
  EditorProps,
  Monaco,
  useMonaco,
} from "@monaco-editor/react";
import { getConfigSetter, Language, getTransformOptions } from "./config";
import { setJsxHighlight } from "./highlighter";
import { DefaultCoderOptions } from "./options";
import { LegacyLib } from "./legacyLib";
import { merge, getLinter, getBabel } from "../util";
import type { TransformOptions } from "@babel/core";
import { registerEvents, Handle } from "./registerEvents";
import type { editor } from "monaco-types";
import { JsxTheme, Theme } from "./jsxTheme";
import "./index.css";

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
  onBlur?: (editor: editor) => void;
  onFocus?: (editor: editor) => void;
}

export type HandlerType = {
  monaco: Monaco;
  editor: editor;
  format(): void;
  compile(
    value: string | undefined,
    options?: TransformOptions
  ): Promise<string>;
};

const Coder = forwardRef<HandlerType, CoderProps>((props: CoderProps, ref) => {
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
  } = _props;
  const lang = language ?? defaultLanguage;

  const [isMounted, setMounted] = useState<boolean>(false);
  const editorRef = useRef<editor>();
  const eventListenRef = useRef<Array<Handle>>([]);
  const monaco = useMonaco();
  const linterRef = useRef<any>();
  const themeTagRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      monaco,
      editor: editorRef.current,
      format() {
        if (editorRef.current) {
          editorRef.current._actions.get("editor.action.formatDocument")._run();
        }
      },
      async compile(value: string, options?: TransformOptions) {
        if (
          !value ||
          ![Language.Javascript, Language.Typescript].includes(lang as Language)
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
    }),
    [monaco, lang, isTsx, babel, isMounted]
  );

  useLayoutEffect(() => {
    if (loaderConfig) {
      loader.config(loaderConfig);
    }
  }, [loaderConfig]);

  useEffect(() => {
    if (
      ![Language.Javascript, Language.Typescript].includes(lang as Language) ||
      !monaco
    )
      return;
    const setCompilerOptions = getConfigSetter(lang as Language);
    setCompilerOptions(monaco);
    const libUri = "ts:filename/facts.d.ts";
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      LegacyLib,
      libUri
    );
    if (extraLib) {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        extraLib,
        libUri
      );
    }
  }, [monaco, extraLib, lang]);

  useEffect(() => {
    if (!monaco || !isMounted || !isTsx) return;
    const highLightHandler = setJsxHighlight(editorRef.current, monaco);
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

  const onMount = (editor: editor, monaco: Monaco) => {
    setMounted(true);
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
    editorRef.current = editor;
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
          monaco.editor.setModelMarkers(model, "ESlint", markers);
        }
      }
    },
    [isMounted, eslint, monaco, lang]
  );

  const onDidFocusEditorText = useCallback(
    (editor: editor) => {
      typeof _props.onFocus === "function" && _props.onFocus(editor);
    },
    [_props.onFocus]
  );

  const onDidBlurEditorText = useCallback(
    (editor: editor) => {
      typeof _props.onBlur === "function" && _props.onBlur(editor);
    },
    [_props.onBlur]
  );

  const onChange = useCallback(
    (value: string | undefined, e: editor.IModelContentChangedEvent) => {
      markerEditor(value);
      typeof _props.onChange === "function" && _props.onChange(value, e);
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

export { Coder, editor, Theme };
