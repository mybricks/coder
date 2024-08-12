import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  memo,
  useLayoutEffect,
} from "react";
import {
  EventSourceMessage,
  fetchEventSource,
} from "@microsoft/fetch-event-source";
import { getBody, getHeaders, safeParse } from "../../../../util";
import { ChatOptions, PromptType } from "../../../../types";
import Icon from "../Icon";
import "./index.less";

export interface MarkdownRenderProps {
  options: ChatOptions;
  prompts: PromptType[];
}

let requestBodyCache: Record<string, any>;

const MarkdownRender = memo(({ options, prompts }: MarkdownRenderProps) => {
  const [ReactMarkdown, setReactMarkdown] = useState<any>();
  const [SyntaxHighlighter, setSyntaxHighlighter] = useState<any>();
  const [SyntaxHighlightTheme, setSyntaxHighlightTheme] = useState<{
    [key: string]: React.CSSProperties;
  }>();
  const [markdown, setMarkdown] = useState("");
  const ref = useRef<HTMLDivElement>(null);
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
      const body = requestBodyCache ?? (await getBody(options.request)) ?? {};
      requestBodyCache = body;
      return fetchEventSource(options.request, {
        headers: getHeaders(options.request),
        body: JSON.stringify({ ...body, messages: prompts }),
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
            requestAnimationFrame(scrollToBottom);
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
                    <span>{match[1]}</span>
                    <Icon
                      name="copy"
                      className="coder-chat-markdown-code-icon"
                      onClick={() => options.onAccept!(String(children))}
                    />
                  </div>
                  <SyntaxHighlighter
                    children={String(children).replace(/\n$/, "")}
                    customStyle={{
                      margin: 0,
                      borderBottomLeftRadius: 4,
                      borderBottomRightRadius: 4,
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
});

export default MarkdownRender;
