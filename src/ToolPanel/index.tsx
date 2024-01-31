import React from "react";
import styles from "./index.module.less";

export interface ToolbarProps {
  children?: React.ReactNode
}

const Toolbar = ({ children }: ToolbarProps) => {
  return (
    <div className={styles.toolbar}>
      {children}
    </div>
  );
};

export default Toolbar;
