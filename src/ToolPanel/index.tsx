import React from "react";
import styles from "./index.module.less";

export interface ToolPanelProps {
  children?: React.ReactNode;
}

const ToolPanel = ({ children }: ToolPanelProps) => {
  return <div className={styles.toolbar}>{children}</div>;
};

export default ToolPanel;
