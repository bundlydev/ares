import { Identity } from "@dfinity/agent";
import { EventEmitter as EventManager } from "events";

import { AUTH_IDENTITY_ADDED, AUTH_IDENTITY_REMOVED } from "./event.constants";

export class EventEmitter {
  constructor(private readonly eventManager: EventManager) {}

  public identityAdded(identity: Identity, provider: string): void {
    this.eventManager.emit(AUTH_IDENTITY_ADDED, { identity, provider });
  }

  public identityRemoved(identity: Identity): void {
    this.eventManager.emit(AUTH_IDENTITY_REMOVED, { identity });
  }
}
