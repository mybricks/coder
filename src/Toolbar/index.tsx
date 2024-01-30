import React from "react";
import Icon from "../Icon";
import styles from "./index.module.less";

export interface ToolbarProps {
  onPlus?(): void;
}

const Toolbar = (props: ToolbarProps) => {
  return (
    <div className={styles.toolbar}>
      <Icon name="plus" onClick={props.onPlus} />
    </div>
  );
};

export default Toolbar;
