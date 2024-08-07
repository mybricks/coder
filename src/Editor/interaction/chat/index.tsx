import React from "react";
import { InteractionOptions } from "../../../types";
import { singleton, getBody, getHeaders } from "../../../util";
import Dialog, { DialogProps } from "@astii/dialog";
import {
  EventSourceMessage,
  fetchEventSource,
} from "@microsoft/fetch-event-source";

class Chat {
  private open!: boolean;
  private body!: Record<string, any>;
  constructor(private readonly options: InteractionOptions) {}
  public async fetchChats(params: any) {
    const body = this.body ?? (await getBody(this.options.request)) ?? {};
    this.body = body;
    return fetchEventSource(this.options.request, {
      headers: getHeaders(this.options.request),
      body: JSON.stringify({ ...body, messages: params.messages }),
      onmessage(event: EventSourceMessage) {
        if (event.data !== "[DONE]") {
          const data = JSON.parse(event.data);
          console.log(data.choices[0].delta.content);
        }
      },
      onerror(err) {
        console.log(err);
      },
    });
  }
  public render() {
    if (this.open) {
      this.open = false;
      return null;
    }
    this.open = true;
    return <Dialog open={this.open}></Dialog>;
  }
}

export default singleton(Chat);
