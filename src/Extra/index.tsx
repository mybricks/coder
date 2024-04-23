import React, { useRef } from "react";
import { Coder, CoderProps } from "../Editor";
import Dialog from "@astii/dialog";
import styles from "./index.module.less";

export interface ExtraProp extends CoderProps {
  comment?: {
    height?: number;
    value?: string;
  };
}

const Extra = (props: ExtraProp) => {
  const { comment, ...codeProps } = props;
  const path = useRef(`${Math.floor(Math.random() * 10)}_comment.ts`);
  const none = () => {};
  return (
    <div className={styles.extra}>
      {comment?.value && (
        <Dialog.Popover
          content={
            <Coder
              {...codeProps}
              onBlur={none}
              onChange={none}
              onFocus={none}
              value={comment.value}
              options={{
                readOnly: true,
                lineNumbers: "off",
                fontSize: codeProps.options?.fontSize,
              }}
              height={comment.height ?? codeProps.height ?? 500}
              path={path.current}
            />
          }
          className={styles.popover}
        >
          <span className={styles.doc}>文档</span>
        </Dialog.Popover>
      )}
    </div>
  );
};

export default Extra;
