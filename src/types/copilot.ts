export type CopilotResult = Array<{
  code: string;
  insertText?: string;
  extra?: { modelVersion: string; modelType: string };
}>;

export type CopilotOptions = {
  language: string;
  request: Request
};
