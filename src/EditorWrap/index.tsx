import React, { forwardRef, useCallback, useMemo, useState } from "react";
import Modal, { ModalProps } from "../Modal";
import Toolbar from "../Toolbar";
import { Coder, CoderProps, HandlerType } from "../Editor";
import { executeChain } from "../util";
import styles from "./index.less";

export type EditorProps = CoderProps & {
  modal?: Pick<ModalProps, "width" | "title" | "onClose"> & { onOpen?(): void };
};

const EditorWrap = forwardRef<HandlerType, EditorProps>((props, ref: any) => {
  const [open, setOpen] = useState<boolean>(false);
  const { modal, value, ...codeProps } = props;
  const [nextValue, setValue] = useState<string | undefined>(value);
  const Editor = useMemo(
    () => <Coder {...codeProps} value={nextValue} ref={ref} />,
    [codeProps, nextValue, ref]
  );

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

  return open ? (
    <Modal {...modal} open={open} onClose={handleClose}>
      {Editor}
    </Modal>
  ) : (
    <div className={styles.wrap}>
      {Editor}
      {modal && <Toolbar onPlus={handleOpen} />}
    </div>
  );
});

export default EditorWrap;
