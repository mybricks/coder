# @mybricks/coder

[![NPM version](https://img.shields.io/npm/v/@mybricks/coder.svg?style=flat)](https://npmjs.org/package/@mybricks/coder)
[![NPM downloads](http://img.shields.io/npm/dm/@mybricks/coder.svg?style=flat)](https://npmjs.org/package/@mybricks/coder)

## Install

```bash
$ yarn add @mybricks/coder
```

## Usage

```jsx
import React, { useCallback, useRef, useState } from "react";
import Editor from "@mybricks/coder";
import type { EditorProps, HandlerType } from "@mybricks/coder"
export default () => {
  const codeIns = useRef<HandlerType>();
  const [value, setValue] = useState<string | undefined>(`const Test = () => {
    const num: number = 123
    return (
      <div className='test'>
        {num}
        <h3 style={{color: '#00FF00'}}>这是一个React组件</h3>
      </div>
    )
  }
  `);

  const handleFormat = () => {
    codeIns.current?.format();
  };

  const handleCompile = useCallback(async () => {
    const code = await codeIns.current.compile(value);
    console.log(code);
  }, [value]);
  /**
   * modal edit
   */
  const modal = {
    title: "编辑代码",
    width: 1000,
    onOpen() {
      console.log('modal opened')
    },
    onClose() {
      console.log('modal closed')
    }
  }

  return (
    <div>
      <button onClick={handleFormat}>format</button>
      <button onClick={handleCompile}>compile</button>
      <div style={{height: 300}}>
        <Editor
          ref={codeIns}
          value={value}
          language="typescript"
          isTsx={true}
          height={800}
          path={"index.tsx"}
          modal={modal}
          onChange={(value) => setValue(value)}
        />
      </div>
    </div>
  );
};

```

## Options

```ts
type EditorProps = {
  /**
   * Default value of the current model
   */
  defaultValue?: string;
  /**
   * Default language of the current model
   */
  defaultLanguage?: string;
  /**
   * Default path of the current model
   * Will be passed as the third argument to `.createModel` method
   * `monaco.editor.createModel(..., ..., monaco.Uri.parse(defaultPath))`
   */
  defaultPath?: string;
  /**
   * Value of the current model
   */
  value?: string;
  /**
   * Language of the current model
   */
  language?: string;
  /**
   * Path of the current model
   * Will be passed as the third argument to `.createModel` method
   * `monaco.editor.createModel(..., ..., monaco.Uri.parse(defaultPath))`
   */
  path?: string;
  /**
   * The theme for the monaco
   * Available options "vs-dark" | "light"
   * Define new themes by `monaco.editor.defineTheme`
   * @default "light"
   */
  theme?: Theme | string;
  /**
   * The line to jump on it
   */
  line?: number;
  /**
   * The loading screen before the editor will be mounted
   * @default "Loading..."
   */
  loading?: ReactNode;
  /**
   * IStandaloneEditorConstructionOptions
   */
  options?: editor.IStandaloneEditorConstructionOptions;
  /**
   * IEditorOverrideServices
   */
  overrideServices?: editor.IEditorOverrideServices;
  /**
   * Indicator whether to save the models' view states between model changes or not
   * Defaults to true
   */
  saveViewState?: boolean;
  /**
   * Indicator whether to dispose the current model when the Editor is unmounted or not
   * @default false
   */
  keepCurrentModel?: boolean;
  /**
   * Width of the editor wrapper
   * @default "100%"
   */
  width?: number | string;
  /**
   * Height of the editor wrapper, must set the height of parentNode
   * @default "100%"
   */
  height?: number | string;
  /**
   * Class name for the editor container
   */
  className?: string;
  /**
   * Props applied to the wrapper element
   */
  wrapperProps?: object;
  /**
   * Signature: function(monaco: Monaco) => void
   * An event is emitted before the editor is mounted
   * It gets the monaco instance as a first argument
   * Defaults to "noop"
   */
  beforeMount?: BeforeMount;
  /**
   * Signature: function(editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => void
   * An event is emitted when the editor is mounted
   * It gets the editor instance as a first argument and the monaco instance as a second
   * Defaults to "noop"
   */
  onMount?: OnMount;
  /**
   * Signature: function(value: string | undefined, ev: monaco.editor.IModelContentChangedEvent) => void
   * An event is emitted when the content of the current model is changed
   */
  onChange?: OnChange;
  /**
   * Signature: function(markers: monaco.editor.IMarker[]) => void
   * An event is emitted when the content of the current model is changed
   * and the current model markers are ready
   * Defaults to "noop"
   */
  onValidate?: OnValidate;
};

interface CoderProps extends EditorProps {
  extraLib?: string;
  isTsx?: boolean;
  loaderConfig?: {
    paths: {
      vs: string;
    };
  };
  eslint?: Partial<{
    src: string;
    config: Record<string, any>;
  }>;
  /**
   * babel-standalone
   * @default "https://unpkg.com/@babel/standalone/babel.min.js"
   */
  babel?: Partial<{
    standalone: string;
    options: TransformOptions;
  }>;
  onBlur?: (editor: editor) => void;
  onFocus?: (editor: editor) => void;
  /**
   * enable modal editor
   */
  modal?: Partial<{
    /**
     * control modal open
     * used with controlled case
     * @default false
     */
    open: boolean;
    title: string;
    /**
     * dialog width
     * @default 1024
     */
    width: number;
    /**
     * dialog can be drag with handler
     * @default false
     */
    draggable: boolean;
    /**
     * dialog can be drag within area
     * @default true
     */
    inside: boolean;
    /**
     * dialog can be close when click mask
     * @default false
     */
    maskClosable: boolean;
    /**
     * @default height: 500px;
     */
    contentClassName: string;
    onOpen: () => void;
    onClose: () => void;
  }>;
  comment?: Partial<{
    /**
     * Comment Editor height
     * @default 300
     */
    height: number;
    value: string;
  }>;
  /**
   * custom toolbar
   */
  toolbar?: React.ReactElement | boolean;
  /**
   * custom render children
   */
  children?: React.ReactElement;
}
```

## Playground

```bash
$ cd playground
$ yarn
$ yarn dev
```

## LICENSE

ISC
