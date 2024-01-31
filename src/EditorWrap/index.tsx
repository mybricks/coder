import React, { forwardRef, useCallback, useMemo, useState } from "react";
import Modal, { ModalProps } from "../Modal";
import ToolPanel from "../ToolPanel";
import Icon from "../Icon";
import type { IconType } from "../Icon";
import { Coder, CoderProps, HandlerType } from "../Editor";
import { executeChain } from "../util";
import styles from "./index.module.less";

export type EditorProps = CoderProps & {
  modal?: Pick<ModalProps, "width" | "title" | "onClose"> & { onOpen?(): void };
  format?: boolean;
  comment?: {
    height?: number;
    value?: string;
  };
};

const EditorWrap = forwardRef<HandlerType, EditorProps>((props, ref: any) => {
  const [open, setOpen] = useState<boolean>(false);
  const { value, modal, format, comment, ...codeProps } = props;
  const [nextValue, setValue] = useState<string | undefined>(value);
  const Editor = useMemo(
    () => <Coder {...codeProps} value={nextValue} ref={ref} />,
    [codeProps, nextValue, ref]
  );

  const Comment = useMemo(() => {
    return comment ? (
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

  const handleFormat = useCallback(() => {
    if (ref!.current.format) {
      ref!.current.format();
    }
  }, []);

  const toolbar = useMemo(() => {
    const tools = [];
    if (format) {
      tools.push(<Icon name="format" onClick={handleFormat} />);
    }
    if (modal && !open) {
      tools.push(<Icon name="plus" onClick={handleOpen} />);
    }
    return <ToolPanel>{tools}</ToolPanel>;
  }, [format, modal, open]);

  return open ? (
    <Modal {...modal} open={open} footer={Comment} onClose={handleClose}>
      {Editor}
      {toolbar}
    </Modal>
  ) : (
    <div className={styles.wrap}>
      {Editor}
      {toolbar}
    </div>
  );
});

export default EditorWrap;
