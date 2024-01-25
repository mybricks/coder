import { useMemo } from "react";

export default ({ code }: { code: string | undefined }) => {
  const Component = useMemo(
    () => eval(code ?? ""),
    [code]
  );
  return (
    <div style={{ padding: "0 20px" }}>
      {Component ? <Component /> : "preview"}
    </div>
  );
};
