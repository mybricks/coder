import { useMemo } from "react";

export default ({ code }: { code: string | undefined }) => {
  const Component = useMemo(
    () => eval(code ?? ""),
    [code]
  );
  return (
    <div style={{ padding: "0 20px", flex: 1 }}>
      {Component ? <Component /> : "preview"}
    </div>
  );
};
