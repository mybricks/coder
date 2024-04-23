import React, { useRef } from "react";
import { Coder, CoderProps } from "../Editor";
import Dialog from "@astii/dialog";
import styles from "./index.module.less";

export interface Extra extends CoderProps {
  comment?: {
    height?: number;
    value?: string;
  };
}

const Extra = (props: Extra) => {
  const { comment, ...codeProps } = props;
  const path = useRef(`${Math.floor(Math.random() * 10)}_comment.ts`);
  return (
    <div className={styles.extra}>
      {comment?.value && (
        <Dialog.Popover
          content={
            <Coder
              {...codeProps}
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
        >
          <span className={styles.doc}>文档</span>
        </Dialog.Popover>
      )}
    </div>
  );
};

export default Extra;
