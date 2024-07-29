import { useCallback, useRef, useState, useEffect } from "react";
import { Switch } from "antd";
import styles from "./App.module.less";
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

  const onCompile = useCallback(async () => {
    const value = ref.current.editor.getValue();
    const code = await ref.current?.compile(value);
    setCode(`(function() {\n${code}\nreturn Test; })()`);
  }, []);

  return (
    <div style={{padding: 12}}>
      <Switch
        checkedChildren="light"
        unCheckedChildren="dark"
        onChange={onSwitch}
      />
      <div className={styles.workspace}>
        <Editor ref={ref} theme={theme} onPreview={onCompile} />
        <Preview code={code} />
      </div>
    </div>
  );
}

export default App;
