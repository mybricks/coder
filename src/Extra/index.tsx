import React, { useCallback, useRef } from "react";
import { Coder, CoderProps } from "../Editor";
import Dialog from "@astii/dialog";
import styles from "./index.module.less";

export interface ExtraProp extends CoderProps {
  comment?: Partial<{
    value: string;
    className: string;
  }>;
}

const Extra = (props: ExtraProp) => {
  const { comment, ...codeProps } = props;
  const path = useRef(`${Math.floor(Math.random() * 10)}_comment.ts`);
  const noop = useCallback(() => {}, []);
  return (
    <div className={styles.extra}>
      {comment?.value && (
        <Dialog.Popover
          content={
            <Coder
              {...codeProps}
              onBlur={noop}
              onChange={noop}
              onFocus={noop}
              value={comment.value}
              options={{
                readOnly: true,
                lineNumbers: "off",
                fontSize: codeProps.options?.fontSize,
              }}
              path={path.current}
            />
          }
          className={comment.className}
        >
          <span className={styles.doc}>文档</span>
        </Dialog.Popover>
      )}
    </div>
  );
};

export default Extra;
