export enum LanguageMapToSuffix {
  typescript = ".ts",
  javascript = ".js",
  python = ".py",
  java = ".java",
  kotlin = ".kt",
  csharp = ".cs",
  c = ".c",
  cpp = ".cpp",
  ruby = ".rb",
  php = ".php",
  swift = ".swift",
  go = ".go",
}

export type LanguageType = keyof typeof LanguageMapToSuffix;

export type CopilotParams = Partial<{
  path: string;
  codeBeforeCursor: string;
  codeAfterCursor: string;
  stream: boolean;
}>;

export type CopilotResult = Array<{
  code: string;
  insertText?: string;
  extra?: { modelVersion: string; modelType: string };
}>;

export type CopilotOptions = {
  language: LanguageType;
  request: Request;
};
