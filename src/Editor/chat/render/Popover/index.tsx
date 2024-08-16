import React, {
  useState,
  CSSProperties,
  useCallback,
  useLayoutEffect,
  useEffect,
  useRef,
} from "react";
import Icon from "../Icon";
import "./index.less";

export interface PopoverProps {
  width?: CSSProperties["width"];
  title?: string;
  rect: DOMRect;
  children: JSX.Element;
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
      setArrowPosition({ left: -16, top: arrowTop - 8 });
    },
    [rect]
  );
  return (
    <div
      style={{
        width,
        transform: `translate(${position?.left}px, ${position?.top}px)`,
      }}
      className="coder-chat-popover"
      ref={popoverRef}
    >
      <div
        className={"coder-chat-popover-arrow"}
        style={{
          transform: `translate(${arrowPosition?.left}px, ${arrowPosition?.top}px) rotate(-90deg)`,
        }}
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
