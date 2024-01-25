import { useCallback, useRef, useState } from "react";
import { Space, Button, Switch } from "antd";
import "./App.css";
import Editor from "./Coder";
import Preview from "./Preview";

function App() {
  const [code, setCode] = useState<string>();
  const [theme, setTheme] = useState<"light" | "vs-dark">("vs-dark");
  const ref = useRef();

  const onSwitch = (checked: boolean) => {
    if (checked) {
      setTheme("light");
    } else {
      setTheme("vs-dark");
    }
  };

  const onFormat = () => {
    ref.current?.format();
  };

  const onCompile = useCallback(async () => {
    const value = ref.current.editor.getValue();
    const code = await ref.current?.compile(value);
    setCode(`(function() {\n${code}\nreturn Test; })()`);
  }, []);

  return (
    <>
      <Space className="toolbar">
        <Switch
          checkedChildren="light"
          unCheckedChildren="dark"
          onChange={onSwitch}
        />
        <Button onClick={onFormat}>format</Button>
        <Button onClick={onCompile} type="primary">
          preview
        </Button>
      </Space>
      <div className="workspace">
        <Editor ref={ref} theme={theme} />
        <Preview code={code} />
      </div>
    </>
  );
}

export default App;
