import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import {
  EventSourceMessage,
  fetchEventSource,
} from "@microsoft/fetch-event-source";
import { getBody, getHeaders, safeParse, clipBoard } from "../../../../util";
import { ChatOptions, PromptType } from "../../../../types";
import Icon from "../Icon";
import "./index.less";

export interface MarkdownRenderProps {
  options: ChatOptions;
  prompts: PromptType[];
  onComplete?: (answer?: string) => void;
}

let requestBodyCache: Record<string, any>;

const MarkdownRender = ({
  options,
  prompts,
  onComplete,
}: MarkdownRenderProps) => {
  const [ReactMarkdown, setReactMarkdown] = useState<any>();
  const [SyntaxHighlighter, setSyntaxHighlighter] = useState<any>();
  const [SyntaxHighlightTheme, setSyntaxHighlightTheme] = useState<{
    [key: string]: React.CSSProperties;
  }>();
  const [markdown, setMarkdown] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const answerRef = useRef<string>("");
  const fetchChats = useCallback(
    async ({
      prompts,
      options,
      controller,
    }: {
      prompts: PromptType[];
      options: ChatOptions;
      controller: AbortController;
    }) => {
      const request = options.request.clone();
      const body = requestBodyCache ?? (await getBody(request)) ?? {};
      requestBodyCache = body;
      return fetchEventSource(request, {
        headers: getHeaders(request),
        body: JSON.stringify({
          stream: true,
          temperature: 0.1,
          ...body,
          messages: prompts,
        }),
        onmessage(event: EventSourceMessage) {
          if (event.data !== "[DONE]") {
            const data = safeParse(event.data);
            const text = (data.choices ?? []).reduce(
              (pre: string, cur: any) => {
                return pre + cur.delta.content;
              },
              ""
            );
            setMarkdown((prev) => prev + text);
            answerRef.current = answerRef.current + text;
            requestAnimationFrame(scrollToBottom);
          } else {
            onComplete!(answerRef.current);
            answerRef.current = "";
          }
        },
        onerror(err) {
          console.error(err);
        },
        signal: controller.signal,
      });
    },
    []
  );

  const scrollToBottom = useCallback(() => {
    if (ref.current) {
      ref.current.scrollTo(
        0,
        ref.current.scrollHeight - ref.current.clientHeight
      );
    }
  }, []);

  useLayoutEffect(() => {
    (async () => {
      const [{ default: ReactMarkdown }, { Prism }, { materialDark }] =
        await Promise.all([
          import("react-markdown"),
          import("react-syntax-highlighter"),
          import("react-syntax-highlighter/dist/esm/styles/prism"),
        ]);
      setReactMarkdown(() => ReactMarkdown);
      setSyntaxHighlighter(() => Prism);
      setSyntaxHighlightTheme(materialDark);
    })();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchChats({ prompts, options, controller });
    return () => {
      controller.abort();
    };
  }, [prompts, options]);

  const onAccept = useCallback((code: string) => {
    clipBoard(code);
    options.onAccept!(code);
  }, []);

  return (
    <div ref={ref} className="coder-chat-markdown">
      {ReactMarkdown && SyntaxHighlighter && (
        <ReactMarkdown
          components={{
            //@ts-ignore
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <div className="coder-chat-markdown-code">
                  <div className="coder-chat-markdown-code-language">
                    <span>{options.language ?? match[1]}</span>
                    <Icon
                      name="copy"
                      className="coder-chat-markdown-code-copy"
                      onClick={() => onAccept(String(children))}
                    />
                  </div>
                  <SyntaxHighlighter
                    children={String(children).replace(/\n$/, "")}
                    customStyle={{
                      margin: 0,
                      borderBottomLeftRadius: 4,
                      borderBottomRightRadius: 4,
                      fontSize: 12,
                    }}
                    showLineNumbers={true}
                    showInlineLineNumbers={true}
                    style={SyntaxHighlightTheme}
                    language={match[1]}
                    lineNumberStyle={{ minWidth: "2rem" }}
                    PreTag={"div"}
                    {...props}
                  />
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {!!markdown ? markdown : "努力生成中..."}
        </ReactMarkdown>
      )}
    </div>
  );
};

export default MarkdownRender;
