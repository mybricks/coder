import React, {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  Children,
  isValidElement,
  CSSProperties,
} from "react";
import Dialog, { DialogProps } from "@astii/dialog";
import Resizable from "@astii/resizable";
import ToolPanel from "../ToolPanel";
import { Coder, CoderProps, HandlerType } from "../Editor";
import { executeChain } from "../util";
import { useUpdate } from "./useUpdate";
import styles from "./index.module.less";

export type EditorProps = CoderProps & {
  modal?: Omit<DialogProps, "children" | "footer"> & {
    onOpen?(): void;
  };
  comment?: {
    height?: number;
    value?: string;
  };
  toolbar?: React.ReactElement | boolean;
  children?: React.ReactElement;
  resizable?: boolean;
  wrapperClassName?: string;
};

const Icon = Dialog.Icon;

const EditorWrap = (props: EditorProps, ref: any) => {
  const {
    value,
    modal,
    comment,
    toolbar,
    resizable,
    wrapperClassName,
    children,
    ...codeProps
  } = props;
  const [open, setOpen] = useState<boolean>(!!modal?.open);
  const [nextValue, setValue] = useState<string | undefined>(() => value);

  useUpdate(() => {
    setOpen(!!modal?.open);
  }, [modal?.open]);

  useUpdate(() => {
    setValue(value);
  }, [value]);

  const Editor = useMemo(
    () => <Coder {...codeProps} value={nextValue} ref={ref} />,
    [codeProps, nextValue, ref]
  );

  const Comment = useMemo(() => {
    const random = Math.floor(Math.random() * 10);
    return comment?.value ? (
      <Coder
        {...codeProps}
        value={comment.value}
        options={{
          readOnly: true,
          lineNumbers: "off",
          fontSize: codeProps.options?.fontSize,
        }}
        height={comment.height ?? codeProps.height ?? 300}
        path={`${random}_comment.ts`}
      />
    ) : null;
  }, [codeProps, comment, codeProps.theme]);

  const setNextValue = useCallback(() => {
    if (ref!.current.editor) {
      const nextValue = ref!.current.editor.getValue();
      setValue(nextValue);
    }
  }, []);

  const handleOpen = useCallback(() => {
    executeChain([setNextValue, () => setOpen(true)]);
    typeof modal?.onOpen === "function" && modal.onOpen();
  }, [modal?.onOpen]);

  const handleClose = useCallback(() => {
    executeChain([setNextValue, () => setOpen(false)]);
    typeof modal?.onClose === "function" && modal.onClose();
  }, [modal?.onClose]);

  const Toolbar = useMemo(() => {
    if (!toolbar) return null;
    const tools = [...Children.toArray(toolbar)];
    if (modal && !open) {
      tools.push(<Icon name="plus" onClick={handleOpen} />);
    }
    return <ToolPanel>{tools}</ToolPanel>;
  }, [modal, open, toolbar]);

  const initHeight = useMemo(() => {
    if (isValidElement(children)) {
      return "fit-content";
    }
    return codeProps.height ?? 500;
  }, [children, codeProps.height]);

  return (
    <ResizableEditor height={initHeight} resizable={resizable} className={wrapperClassName}>
      {open && (
        <Dialog
          draggable={true}
          contentClassName={styles["dialog-content"]}
          {...modal}
          open={open}
          footer={Comment}
          onClose={handleClose}
        >
          {Editor}
          {Toolbar}
        </Dialog>
      )}
      {children}
      {!open && !children && (
        <>
          {Editor}
          {Toolbar}
        </>
      )}
    </ResizableEditor>
  );
};

const ResizableEditor = ({
  height,
  resizable,
  className,
  children,
}: {
  height: CSSProperties["height"];
  resizable?: boolean;
  className?: string;
  children?: React.ReactNode;
}) => {
  const [size, setSize] = useState<CSSProperties["height"]>(height);
  const wrap = useMemo(
    () => (
      <div
        className={`${styles.wrap} ${className ?? ""}`}
        style={{ height: size }}
      >
        {children}
      </div>
    ),
    [size, children, className]
  );
  const onResize = ({ height }: { height: CSSProperties["height"] }) => {
    setSize(height);
  };
  return !!resizable ? (
    <Resizable axis="y" onResize={onResize}>
      {wrap}
    </Resizable>
  ) : (
    wrap
  );
};

export default forwardRef<HandlerType, EditorProps>(EditorWrap);
