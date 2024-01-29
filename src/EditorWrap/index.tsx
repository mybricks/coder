import React, { forwardRef, useCallback, useMemo, useState } from "react";
import Modal, { ModalProps } from "../Modal";
import Toolbar from "../Toolbar";
import { Coder, CoderProps, HandlerType } from "../Editor";
import styles from "./index.less";

export type EditorProps = CoderProps & {
  modal: Pick<ModalProps, "width" | "title" | "onClose"> & { onOpen?(): void };
};

const EditorWrap = forwardRef<HandlerType, EditorProps>((props, ref) => {
  const [open, setOpen] = useState<boolean>(false);
  const { modal, ...codeProps } = props;
  const Editor = useMemo(
    () => <Coder {...codeProps} ref={ref} />,
    [codeProps, ref]
  );

  const handleOpen = useCallback(() => {
    typeof modal?.onClose === "function" && modal.onClose();
    setOpen(true);
  }, [modal?.onOpen]);

  const handleClose = useCallback(() => {
    typeof modal?.onClose === "function" && modal.onClose();
    setOpen(false);
  }, [modal?.onClose]);

  return open ? (
    <Modal {...modal} open={open} onClose={handleClose}>
      {Editor}
    </Modal>
  ) : (
    <div className={styles.wrap}>
      {Editor}
      <Toolbar onPlus={handleOpen} />
    </div>
  );
});

export default EditorWrap;
