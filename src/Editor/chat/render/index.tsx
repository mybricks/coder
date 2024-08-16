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
    this.container = document.getElementById("chat-container")!;
  }

  private isMounted() {
    return !!document.getElementById("chat-container")?.childNodes.length;
  }

  private unmount() {
    //@ts-ignore
    render(null, this.container);
    if (this.isMounted()) {
      this.options.onFree!();
    }
  }
  public render(rect: DOMRect) {
    this.unmount();
    requestAnimationFrame(() => {
      render(
        <Popover
          rect={rect}
          title={ChatType[this.chatType]}
          onClose={this.unmount.bind(this)}
        >
          <MarkdownRender options={this.options} prompts={this.prompts} />
        </Popover>,
        this.container
      );
    });
  }
}

export default singleton(Chat);
