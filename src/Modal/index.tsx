import React from "react";
import Icon from "../Icon";
import styles from "./index.module.less";

type CalStyle = number | string;

export interface ModalProps {
  open?: boolean;
  title?: React.ReactNode | string;
  width?: CalStyle;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
}

const Modal = ({
  open,
  title = "Coding",
  width = 1024,
  children,
  footer,
  onClose,
}: ModalProps) => {
  return open ? (
    <div className={styles["modal-root"]}>
      <div className={styles["modal-mask"]} />
      <div className={styles["modal-wrap"]}>
        <div className={styles.modal} style={{ width }}>
          <div className={styles["modal-header"]}>{title}</div>
          <div className={styles["modal-content"]}>{children}</div>
          <Icon name="close" className={styles.close} onClick={onClose} />
          {footer && <div className={styles["modal-footer"]}>{footer}</div>}
        </div>
      </div>
    </div>
  ) : null;
};

export default Modal;
