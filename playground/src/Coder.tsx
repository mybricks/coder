import { forwardRef, useReducer } from "react";
import { Tabs } from "antd";
import { Coder as Editor } from "../../src/Editor";

const items = [
  {
    label: "index.ts",
    key: "ts",
    language: "typescript",
    path: "index.ts",
    value: `({ outputs, inputs }: IO) => {
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

export default forwardRef(({ theme = "vs-dark" }, ref) => {
  const [state, dispatch] = useReducer(reducer, { items, tab: "ts" });

  const onChange = (value: string | undefined, e: any) => {
    dispatch({ type: "onChange", value });
  };

  const onTabChange = (activeKey: string) => {
    dispatch({ type: "onTabChange", value: activeKey });
  };

  return (
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
            onChange={onChange}
            theme={theme}
          />
        </Tabs.TabPane>
      ))}
    </Tabs>
  );
});
