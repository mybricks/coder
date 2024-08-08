import React from "react";
import { ChatOptions, ChatType, PromptType } from "../../../types";
import { singleton } from "../../../util";
import { createRoot, Root } from "react-dom/client";
import Popover from "./Popover";
import MarkdownRender from "./Markdown";

class Chat {
  private root!: Root;
  public chatType!: keyof typeof ChatType;
  public prompts!: PromptType[];
  constructor(private readonly options: ChatOptions) {
    this.root = createRoot(document.getElementById("chat-container")!);
  }

  private onClose() {
    this.root.render(null);
  }
  public render(rect: DOMRect) {
    this.root.render(null);
    requestAnimationFrame(() => {
      this.root.render(
        <Popover
          rect={rect}
          title={ChatType[this.chatType]}
          onClose={this.onClose.bind(this)}
        >
          <MarkdownRender options={this.options} prompts={this.prompts} />
        </Popover>
      );
    });
  }
}

export default singleton(Chat);
