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
  onComplete?: (answer?: string, duration?: number) => void;
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
  const [finish, setFinish] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
  const answerRef = useRef<string>("");
  const fetchControllerRef = useRef<AbortController | null>();
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
      const requestStart = Date.now();
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
            const duration = Date.now() - requestStart;
            onComplete!(answerRef.current, duration);
            setFinish(true);
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
      const [{ default: ReactMarkdown }, { Prism }, { vscDarkPlus }] =
        await Promise.all([
          import("react-markdown"),
          import("react-syntax-highlighter"),
          import("react-syntax-highlighter/dist/esm/styles/prism"),
        ]);
      setReactMarkdown(() => ReactMarkdown);
      setSyntaxHighlighter(() => Prism);
      setSyntaxHighlightTheme(vscDarkPlus);
    })();
  }, []);

  useEffect(() => {
    fetchControllerRef.current = new AbortController();
    fetchChats({ prompts, options, controller: fetchControllerRef.current });
    return () => {
      cancelSpeak();
      fetchControllerRef.current!.abort();
      answerRef.current = "";
    };
  }, [prompts, options]);

  const onCopy = useCallback(() => {
    clipBoard(answerRef.current);
  }, []);

  const onCodeCopy = useCallback(
    (code: string) => {
      clipBoard(code);
      typeof options.onCodeCopy === "function" && options.onCodeCopy(code);
    },
    [options.onCodeCopy]
  );

  const onAgree = useCallback(() => {
    typeof options.onAgree === "function" && options.onAgree();
  }, [options.onAgree]);

  const onOppose = useCallback(() => {
    typeof options.onOppose === "function" && options.onOppose();
  }, [options.onOppose]);

  const onRefresh = useCallback(() => {
    setMarkdown("");
    cancelSpeak();
    setFinish(false);
    fetchControllerRef.current = new AbortController();
    fetchChats({ prompts, options, controller: fetchControllerRef.current });
  }, []);

  const onSpeak = useCallback(() => {
    if (window.speechSynthesis) {
      cancelSpeak();
      window.speechSynthesis.speak(
        new SpeechSynthesisUtterance(answerRef.current)
      );
    }
  }, []);

  const cancelSpeak = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return (
    <>
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
                        tooltip="复制"
                        className="coder-chat-markdown-code-copy"
                        onClick={() => onCodeCopy(String(children))}
                      />
                    </div>
                    <SyntaxHighlighter
                      children={String(children).replace(/\n$/, "")}
                      customStyle={{
                        margin: 0,
                        borderBottomLeftRadius: 4,
                        borderBottomRightRadius: 4,
                        fontSize: 12,
                        backgroundColor: "rgba(40, 40, 40, 0.85)",
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
      <div
        className={"coder-chat-toolbar"}
        style={{ display: finish ? "flex" : "none" }}
      >
        <Icon
          name="speak"
          tooltip="朗读"
          className="coder-chat-toolbar-icon"
          onClick={onSpeak}
        />
        <Icon
          name="copy"
          tooltip="复制"
          className="coder-chat-toolbar-icon"
          onClick={onCopy}
        />
        <Icon
          name="accept"
          tooltip="赞一下"
          className="coder-chat-toolbar-icon"
          onClick={onAgree}
        />
        <Icon
          name="reject"
          tooltip="踩一下"
          className="coder-chat-toolbar-icon"
          onClick={onOppose}
        />
        <Icon
          name="refresh"
          tooltip="重新生成"
          className="coder-chat-toolbar-icon"
          onClick={onRefresh}
        />
      </div>
    </>
  );
};

export default MarkdownRender;
