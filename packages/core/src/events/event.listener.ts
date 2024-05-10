import { Identity } from "@dfinity/agent";
import { EventEmitter as EventManager } from "events";

import { AUTH_IDENTITY_ADDED, AUTH_IDENTITY_REMOVED } from "./event.constants";

export type OnIdentityAddedCallbackPayload = {
  identity: Identity;
  provider: string;
};
export type OnIdentityAddedCallback = (payload: OnIdentityAddedCallbackPayload) => void;

export type OnIdentityRemoveCallbackPayload = {
  identity: Identity;
};
export type OnIdentityRemoveCallback = (payload: OnIdentityRemoveCallbackPayload) => void;

export class EventListener {
  constructor(private readonly eventManager: EventManager) {}

  public onIdentityAdded(callback: OnIdentityAddedCallback): void {
    this.eventManager.on(AUTH_IDENTITY_ADDED, callback);
  }

  public onIdentityRemoved(callback: OnIdentityRemoveCallback): void {
    this.eventManager.on(AUTH_IDENTITY_REMOVED, callback);
  }
}
