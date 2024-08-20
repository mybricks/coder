import React from "react";
import { ChatOptions, ChatType, PromptType } from "../../../types";
import { singleton } from "../../../util";
import { render } from "react-dom";
import Popover from "./Popover";
import MarkdownRender from "./Markdown";

class Chat {
  private container!: HTMLElement;
  public chatType!: keyof typeof ChatType;
  public prompts!: PromptType[];
  constructor(private readonly options: ChatOptions) {
    const container = document.createElement("div");
    container.id = "editor-chat-container";
    document.body.appendChild(container);
    this.container = container;
  }

  private onComplete(answer?: string) {
    return this.options.onChat?.({
      type: this.chatType,
      code: this.prompts[0].content,
      answer,
    });
  }

  private unmount() {
    requestAnimationFrame(() => {
      //@ts-ignore
      render(null, this.container);
    });
  }
  public render(rect: DOMRect) {
    this.unmount();
    requestIdleCallback(() => {
      render(
        <Popover
          rect={rect}
          title={ChatType[this.chatType]}
          onClose={this.unmount.bind(this)}
        >
          <MarkdownRender
            options={this.options}
            prompts={this.prompts}
            onComplete={this.onComplete.bind(this)}
          />
        </Popover>,
        this.container
      );
    });
  }
  public dispose() {
    document.body.removeChild(this.container);
  }
}

export default singleton(Chat);
