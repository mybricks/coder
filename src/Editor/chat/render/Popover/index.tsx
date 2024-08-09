import React, {
  useState,
  CSSProperties,
  type ReactElement,
  JSXElementConstructor,
  useCallback,
  useLayoutEffect,
  useEffect,
  useRef,
} from "react";
import Dialog from "@astii/dialog";
import "./index.less";

const Icon = Dialog.Icon;

export interface PopoverProps {
  width?: CSSProperties["width"];
  title?: string;
  rect: DOMRect;
  children?: ReactElement<any, string | JSXElementConstructor<any>>;
  onClose?: () => void;
}

type Position = Partial<{
  left: CSSProperties["left"];
  top: CSSProperties["top"];
}>;

const Popover = ({
  width = 600,
  title,
  rect,
  onClose,
  children,
}: PopoverProps) => {
  const [position, setPosition] = useState<Position>();
  const [arrowPosition, setArrowPosition] = useState<Position>();
  const popoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    calcPosition();
  }, []);

  useEffect(() => {
    if (popoverRef.current) {
      const observable = new MutationObserver(() => {
        const rect = popoverRef.current!.getBoundingClientRect();
        calcPosition(rect.height);
      });
      observable.observe(popoverRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  }, []);

  const calcPosition = useCallback(
    (height = 40) => {
      const {
        top: triggerTop,
        left: triggerLeft,
        width: triggerWidth,
        height: triggerHeight,
      } = rect;
      const top = Math.max(
        0,
        Math.min(document.body.clientHeight - height, triggerTop - height / 2)
      );
      const arrowTop = triggerTop - top + triggerHeight / 2;
      setPosition({ left: triggerLeft + triggerWidth + 20, top });
      setArrowPosition({ left: 0, top: arrowTop });
    },
    [rect]
  );
  return (
    <div
      style={{ width, ...position, right: 0, bottom: 0 }}
      className="coder-chat-popover"
      ref={popoverRef}
    >
      <div
        className={"coder-chat-popover-arrow"}
        style={{ ...arrowPosition }}
      />
      <Icon
        name="close"
        className="coder-chat-popover-close"
        onClick={onClose}
      />
      <h3 className="coder-chat-popover-title">{title}</h3>
      <div className="coder-chat-popover-content">{children}</div>
    </div>
  );
};

export default Popover;
