import { type LanguageType } from "./copilot";
import { type EditorRange } from "./editor";
export type InteractionOptions = {
  duration?: number;
  language: LanguageType;
  request: Request;
  onAccept?(): void;
  onFree?(): void;
};

export enum InteractionType {
  CODE_EXPLANATION = "代码解释",
  CODE_OPTIMIZATION = "调优建议",
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
  value?: string
};

export type onCommandExecute = (
  key: keyof typeof InteractionType,
  loc: ASTLocation
) => void;
