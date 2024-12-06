import React, { useMemo, memo, useState, useCallback } from "react";
import Icon from "../Icon";
import { TOOL_TYPE } from "../../../../types/chat";
import { useTimeout } from "../../hooks";

export interface ToolbarProps {
  visible: boolean;
  tools?: (keyof typeof TOOL_TYPE)[];
  onCopy?: () => void;
  onAgree?: () => void;
  onOppose?: () => void;
  onRefresh?: () => void;
  onSpeak?: () => void;
}

const ChatToolbar = memo(
  ({
    visible,
    tools,
    onCopy,
    onAgree,
    onOppose,
    onRefresh,
    onSpeak,
  }: ToolbarProps) => {
    const [copied, setCopied] = useState<boolean>();

    useTimeout(
      () => {
        setCopied(false);
      },
      2000,
      [copied]
    );

    const copyHandler = useCallback(() => {
      onCopy?.();
      setCopied(true);
    }, [onCopy]);

    const Tools = useMemo(() => {
      const content = [];
      if (tools?.includes(TOOL_TYPE.SPEAK)) {
        content.push(
          <Icon
            name="speak"
            key={"speak"}
            tooltip="朗读"
            className="coder-chat-toolbar-icon"
            onClick={onSpeak}
          />
        );
      }
      if (tools?.includes(TOOL_TYPE.COPY)) {
        content.push(
          copied ? (
            <Icon name="success" key={"copy-success"} />
          ) : (
            <Icon
              name="copy"
              key={"copy"}
              tooltip="复制"
              className="coder-chat-toolbar-icon"
              onClick={copyHandler}
            />
          )
        );
      }
      if (tools?.includes(TOOL_TYPE.AGREE)) {
        content.push(
          <Icon
            name="accept"
            key={"accept"}
            tooltip="赞一下"
            className="coder-chat-toolbar-icon"
            onClick={onAgree}
          />
        );
      }
      if (tools?.includes(TOOL_TYPE.OPPOSE)) {
        content.push(
          <Icon
            name="reject"
            key={"reject"}
            tooltip="踩一下"
            className="coder-chat-toolbar-icon"
            onClick={onOppose}
          />
        );
      }
      if (tools?.includes(TOOL_TYPE.REFRESH)) {
        content.push(
          <Icon
            name="refresh"
            key={"refresh"}
            tooltip="重新生成"
            className="coder-chat-toolbar-icon"
            onClick={onRefresh}
          />
        );
      }
      return content;
    }, [tools, copied, onRefresh, onSpeak, copyHandler]);

    return (
      <div
        className={"coder-chat-toolbar"}
        style={{ display: visible && Tools.length ? "flex" : "none" }}
      >
        {Tools.map((it) => it)}
      </div>
    );
  },
  (prev, next) => prev.visible === next.visible
);

export default ChatToolbar;
