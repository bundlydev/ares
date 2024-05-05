import { EventEmitter as EventManager } from "events";

import {
  AUTH_CONNECT_ERROR,
  AUTH_CONNECT_SUCCESS,
  AUTH_DISCONNECT_ERROR,
  AUTH_DISCONNECT_SUCCESS,
} from "./event.constants";
import {
  AuthConnectErrorPayload,
  AuthConnectSuccessPayload,
  AuthDisconnectErrorPayload,
} from "./event.types";

export class EventEmitter {
  constructor(private readonly eventManager: EventManager) {}

  public connectSuccess(payload: AuthConnectSuccessPayload): void {
    this.eventManager.emit(AUTH_CONNECT_SUCCESS, payload);
  }

  public connectError(payload: AuthConnectErrorPayload): void {
    this.eventManager.emit(AUTH_CONNECT_ERROR, payload);
  }

  public disconnectSuccess(): void {
    this.eventManager.emit(AUTH_DISCONNECT_SUCCESS);
  }

  public disconnectError(payload: AuthDisconnectErrorPayload): void {
    this.eventManager.emit(AUTH_DISCONNECT_ERROR, payload);
  }
}
