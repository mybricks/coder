import React, { useEffect, useState, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  EventSourceMessage,
  fetchEventSource,
} from "@microsoft/fetch-event-source";
import { getBody, getHeaders, safeParse } from "../../../../util";
import { ChatOptions, PromptType } from "../../../../types";

export interface MarkdownRenderProps {
  options: ChatOptions;
  prompts: PromptType[];
}

let requestBodyCache: Record<string, any>;

const MarkdownRender = ({ options, prompts }: MarkdownRenderProps) => {
  const [markdown, setMarkdown] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const fetchChats = async ({
    prompts,
    options,
  }: {
    prompts: PromptType[];
    options: ChatOptions;
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
    });
  };

  const scrollToBottom = useCallback(() => {
    if (ref.current) {
      const box = ref.current.parentElement as HTMLDivElement;
      box.scrollTo(0, box.scrollHeight - box.clientHeight);
    }
  }, []);

  useEffect(() => {
    fetchChats({ prompts, options });
    return () => {};
  }, [prompts, options]);
  return (
    <div ref={ref}>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};

export default MarkdownRender;
