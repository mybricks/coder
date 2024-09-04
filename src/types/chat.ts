import { type LanguageType } from "./copilot";
import { type EditorRange } from "./editor";
export type ChatOptions = {
  language: LanguageType;
  duration?: number;
  request: Request;
  onCopy?(content?: string): void;
  onAgree?(): void;
  onOppose?(): void;
  onCodeCopy?(code?: string): void;
  onChat?(params: {
    type: keyof typeof ChatType;
    code?: string;
    answer?: string;
    duration?: number;
  }): void;
};

export enum ChatType {
  CODE_EXPLANATION = "代码解释",
  CODE_OPTIMIZATION = "调优建议",
  CODE_COMMENT = "代码注释",
}

export type ASTPosition = {
  line: number;
  column: number;
  index?: number;
};

export type ASTLocation = {
  start: ASTPosition;
  end: ASTPosition;
  filename?: string;
  identifierName?: string;
  range?: EditorRange;
  value?: string;
};

export type onCommandExecute = (
  key: keyof typeof ChatType,
  loc: ASTLocation
) => void;

export type PromptType = {
  content?: string;
  role: "user" | "assistant";
};
