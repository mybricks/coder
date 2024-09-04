import { ChatType } from "../../types";
export const prompts = {
  CODE_EXPLANATION: {
    title: ChatType.CODE_EXPLANATION,
    content: "请解释这段代码",
  },
  CODE_OPTIMIZATION: {
    title: ChatType.CODE_OPTIMIZATION,
    content: "请给出这段代码的调优建议",
  },
  CODE_COMMENT: {
    title: ChatType.CODE_COMMENT,
    content: "请给这段代码添加注释",
  },
};
