import React, { useCallback, useRef } from "react";
import { Coder, CoderProps } from "../Editor";
import Dialog from "@astii/dialog";
import styles from "./index.module.less";

export interface ExtraProp extends CoderProps {
  comment?: Partial<{
    value: string;
    className: string;
  }>;
  children?: React.ReactNode;
}

const Icon = Dialog.Icon;

const Extra = (props: ExtraProp) => {
  const { comment, children, ...codeProps } = props;
  const path = useRef(`${Math.floor(Math.random() * 10)}_comment.ts`);
  const noop = useCallback(() => {}, []);
  return (
    <div className={styles.extra}>
      <div>{children}</div>
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
          <Icon name="doc" data-mybricks-tip="文档" />
        </Dialog.Popover>
      )}
    </div>
  );
};

export default Extra;
