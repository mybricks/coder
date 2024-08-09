import React, { useEffect, useState, useCallback, useRef, memo } from "react";
//@ts-ignore
import ReactMarkdown from "react-markdown";
import {
  EventSourceMessage,
  fetchEventSource,
} from "@microsoft/fetch-event-source";
import { getBody, getHeaders, safeParse } from "../../../../util";
import { ChatOptions, PromptType } from "../../../../types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./index.less";

export interface MarkdownRenderProps {
  options: ChatOptions;
  prompts: PromptType[];
}

let requestBodyCache: Record<string, any>;

const MarkdownRender = memo(({ options, prompts }: MarkdownRenderProps) => {
  const [markdown, setMarkdown] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const fetchChats = async ({
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
          const text = (data.choices ?? []).reduce((pre: string, cur: any) => {
            return pre + cur.delta.content;
          }, "");
          setMarkdown((prev) => prev + text);
          requestAnimationFrame(scrollToBottom);
        }
      },
      onerror(err) {
        console.error(err);
      },
      signal: controller.signal,
    });
  };

  const scrollToBottom = useCallback(() => {
    if (ref.current) {
      ref.current.scrollTo(
        0,
        ref.current.scrollHeight - ref.current.clientHeight
      );
    }
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
      <ReactMarkdown
        components={{
          //@ts-ignore
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                children={String(children).replace(/\n$/, "")}
                //@ts-ignore
                style={materialDark}
                language={match[1]}
                PreTag="div"
                {...props}
              />
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
    </div>
  );
});

export default MarkdownRender;
