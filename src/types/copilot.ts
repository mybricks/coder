export type CopilotResult = Array<{
  code: string;
  extra?: { modelVersion: string; modelType: string };
}>;

export type CopilotOptions = {
  language: string;
  getCompletions: () => Promise<CopilotResult>;
};
