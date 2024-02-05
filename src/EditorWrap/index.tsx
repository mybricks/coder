import React, {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
  Children,
} from "react";
import Modal, { ModalProps } from "../Modal";
import ToolPanel from "../ToolPanel";
import Icon from "../Icon";
import { Coder, CoderProps, HandlerType } from "../Editor";
import { executeChain } from "../util";
import styles from "./index.module.less";

export type EditorProps = CoderProps & {
  modal?: Pick<ModalProps, "open" | "width" | "title" | "onClose"> & {
    onOpen?(): void;
  };
  comment?: {
    height?: number;
    value?: string;
  };
  toolbar?: React.ReactElement;
  children?: React.ReactElement;
};

const EditorWrap = (props: EditorProps, ref: any) => {
  const { value, modal, comment, toolbar, children, ...codeProps } = props;
  const [open, setOpen] = useState<boolean>(!!modal?.open);
  const [nextValue, setValue] = useState<string | undefined>(value);

  useEffect(() => {
    setOpen(!!modal?.open);
  }, [modal?.open]);

  const Editor = useMemo(
    () => <Coder {...codeProps} value={nextValue} ref={ref} />,
    [codeProps, nextValue, ref]
  );

  const Comment = useMemo(() => {   
    return comment?.value ? (
      <Coder
        value={comment.value}
        options={{ readOnly: true, lineNumbers: "off" }}
        theme={codeProps.theme}
        height={comment.height ?? 300}
        path="comment.ts"
      />
    ) : null;
  }, [comment, codeProps.theme]);

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
    const tools = [...Children.toArray(toolbar)];
    if (modal && !open) {
      tools.push(<Icon name="plus" onClick={handleOpen} />);
    }
    return <ToolPanel>{tools}</ToolPanel>;
  }, [modal, open, toolbar]);

  return open ? (
    <Modal {...modal} open={open} footer={Comment} onClose={handleClose}>
      {Editor}
      {Toolbar}
    </Modal>
  ) : (
    <div className={styles.wrap}>
      {children ? (
        children
      ) : (
        <>
          {Editor}
          {Toolbar}
        </>
      )}
    </div>
  );
};

export default forwardRef<HandlerType, EditorProps>(EditorWrap);
