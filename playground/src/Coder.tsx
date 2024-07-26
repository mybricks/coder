import {
  forwardRef,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Button, Tabs } from "antd";
import Editor, {
  Icon,
  registerCopilot,
  type HandlerType,
  Monaco,
  editor,
} from "../../src";
import css from "./App.module.less";

const items = [
  {
    label: "index.ts",
    key: "ts",
    language: "typescript",
    path: "index.ts",
    value: `type IO = {
      inputs: Array<Function>
      outputs: Array<Function>
    }
    ({ outputs, inputs }: IO) => {
      const [ inputValue0 ] = inputs;
      const [ output0 ] = outputs;
      output0(inputValue0);
    }
    `,
  },
  {
    label: "index.css",
    key: "css",
    language: "css",
    path: "index.css",
    value: `html {
        background-color: #e2e2e2;
        margin: 0;
        padding: 0;
        }
        body {
            background-color: #fff;
            border-top: solid 10px #000;
            color: #333;
            font-size: .85em;
            font-family: "Segoe UI","HelveticaNeue-Light", sans-serif;
            margin: 0;
            padding: 0;
        }`,
  },
  {
    label: "index.tsx",
    key: "tsx",
    language: "typescript",
    isTsx: true,
    path: "index.tsx",
    value: `const Test = () => {
                const num: number = 123
                return (
                <div className='test'>
                    {num}
                    <h3 style={{color: '#00FF00'}}>这是一个React组件</h3>
                </div>
                )
            }`,
  },
];

const reducer = (state: any, action: { type: string; value: any }) => {
  const { type, value } = action;
  switch (type) {
    case "onChange":
      const { tab } = state;
      const index = state.items.findIndex(({ key }) => key === tab);
      const item = items[index];
      items.splice(index, 1, { ...item, value });
      return { ...state, items };
    case "onTabChange":
      return { ...state, tab: value };
    default:
      return state;
  }
};

export default forwardRef<any, HandlerType>(
  ({ theme = "vs-dark", onPreview }, ref) => {
    const [state, dispatch] = useReducer(reducer, { items, tab: "ts" });
    const [editor, setEditor] = useState<editor>();
    const [monaco, setMonaco] = useState<Monaco>();

    const onChange = (value: string | undefined, e: any) => {
      console.log("----onChange------");
      dispatch({ type: "onChange", value });
    };

    const onTabChange = (activeKey: string) => {
      dispatch({ type: "onTabChange", value: activeKey });
    };

    const onBlur = (editor) => {
      console.log("blur");
      dispatch({ type: "onChange", value: editor.getValue() });
    };

    const [open, setOpen] = useState<boolean>(false);

    const getCompletions = useCallback(async ({ codeBeforeCursor }) => {
      return fetch("/copilot/v2/code/completions", {
        method: "POST",
        headers: {
          "x-dmo-provider": "kwaipilot",
          "Content-Type": "application/json",
          "x-dmo-username": "tangxiaoxin",
          authorization: "Bearer mbjuOzymwpWZEO",
        },
        body: JSON.stringify({
          path: "index.ts",
          codeBeforeCursor,
          stream: false,
        }),
      })
        .then(async (res) => {
          const ret = await res.json();
          console.log(ret);
          return ret.data;
        })
        .catch((err) => {
          console.log(err);
        });
      // return new Promise((resolve) => {
      //   setTimeout(() => {
      //     resolve([
      //       {
      //         code: `export const getServerSideProps = async () => {
      //       console.log("Dashboard getServerSideProps");
      //       return {
      //         props: {},
      //       };
      //     };`,
      //       },
      //     ]);
      //   }, 100);
      // });
    }, []);

    useEffect(() => {
      if (!monaco || !editor) return;
      const dispose = registerCopilot(monaco, editor, {
        language: "typescript",
        request: new Request(
          "https://ai-gateway.corp.kuaishou.com/v2/code/completions",
          {
            headers: {
              "x-dmo-provider": "kwaipilot",
              "x-dmo-username": "tangxiaoxin",
              authorization: "Bearer mbjuOzymwpWZEO",
              "Content-Type": "application/json",
            },
          }
        ),
      });
      return () => {
        dispose();
      };
    }, [monaco, editor]);

    const transform = async () => {
      try {
        const ret = await ref.current.transform({ semantic: true });
        console.log(ret);
      } catch (error) {
        console.log(error);
      }
    };

    const babel = async () => {
      if (!ref?.current) return;
      const ret = await ref.current.compile();
      console.log(ret);
    };

    const warning = async () => {
      if (!ref?.current) return;
      const ret = await ref.current.getSemanticDiagnostics();
      console.log(ret);
    };

    return (
      <>
        <Tabs
          style={{ width: "50%" }}
          tabPosition="left"
          onChange={onTabChange}
          destroyInactiveTabPane
        >
          {state.items.map(({ label, key, ...rest }) => (
            <Tabs.TabPane tab={label} key={key} style={{ height: 800 }}>
              <Editor
                key={key}
                ref={ref}
                {...rest}
                // onChange={onChange}
                // height={800}
                theme={theme}
                onBlur={onBlur}
                onMount={(editor, monaco) => {
                  setEditor(editor);
                  setMonaco(monaco);
                }}
                modal={{
                  inside: true,
                  maskClosable: true,
                }}
                format={true}
                toolbar={
                  <>
                    <Icon
                      name="format"
                      onClick={() => {
                        ref.current.format();
                      }}
                    />
                    {rest.isTsx && (
                      <Icon
                        name="preview"
                        onClick={() => {
                          onPreview();
                        }}
                      />
                    )}
                  </>
                }
                comment={{
                  value: `/**
              * @parma inputs: any[] 输入项
              * @parma outputs: any[] 输出项
              *
              * 例子
              * ({ inputs, outputs }: IO) => {
              *   const [ inputValue0, inputValue1 ] = inputs;
              *   const [ output0, output1, output2 ] = outputs;
              *   const res = '该值输出给下一个组件使用' + inputValue0
              *   
              *   // 向输出项（output0）输出结果
              *   output0(res); 
              
              *   // 多输出的情况
              *   // 向输出项（output1）输出输入项0的值
              *   // output1(inputValue0); 
              *   // 向输出项（output2）输出输入项1的值
              *   // output2(inputValue1); 
              * }
              */`,
                  className: css.comment,
                }}
              />
            </Tabs.TabPane>
          ))}
        </Tabs>
        <Button onClick={transform}>transform</Button>
        <Button onClick={babel}>babel</Button>
        <Button type="dashed" onClick={warning}>
          warning
        </Button>
      </>
    );
  }
);
