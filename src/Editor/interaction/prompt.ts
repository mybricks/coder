import { InteractionType } from "../../types";
export const prompts = {
  CODE_EXPLANATION: {
    title: InteractionType.CODE_EXPLANATION,
    content: "请解释这段代码",
  },
  CODE_OPTIMIZATION: {
    title: InteractionType.CODE_OPTIMIZATION,
    content: "请给出这段代码的调优建议",
  },
};
