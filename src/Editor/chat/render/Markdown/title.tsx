import React, { useCallback, useState } from "react";
import Icon from "../Icon";
import { useTimeout } from "../../hooks";

const Title = ({ language, onCopy }: { language: string; onCopy(): void }) => {
  const [copied, setCopied] = useState<boolean>();
  useTimeout(
    () => {
      setCopied(false);
    },
    2000,
    [copied]
  );

  const copyHandler = useCallback(() => {
    onCopy();
    setCopied(true);
  }, [onCopy]);

  return (
    <div className="coder-chat-markdown-code-language">
      <span>{language}</span>
      {copied ? (
        <Icon name="success" />
      ) : (
        <Icon
          name="copy"
          tooltip="复制"
          className="coder-chat-markdown-code-copy"
          onClick={copyHandler}
        />
      )}
    </div>
  );
};

export default Title;
