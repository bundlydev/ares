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

export type ListenAuthConnectSuccessCallback = (payload: AuthConnectSuccessPayload) => void;

export type ListenAuthConnectErrorCallback = (payload: AuthConnectErrorPayload) => void;

export type ListenAuthDisconnectSuccessCallback = () => void;

export type ListenAuthDisconnectErrorCallback = (payload: AuthDisconnectErrorPayload) => void;

export class EventListener {
  constructor(private readonly eventManager: EventManager) {}

  public connectSuccess(callback: ListenAuthConnectSuccessCallback): void {
    this.eventManager.on(AUTH_CONNECT_SUCCESS, callback);
  }

  public connectError(callback: ListenAuthConnectErrorCallback): void {
    this.eventManager.on(AUTH_CONNECT_ERROR, callback);
  }

  public disconnectSuccess(callback: ListenAuthDisconnectSuccessCallback): void {
    this.eventManager.on(AUTH_DISCONNECT_SUCCESS, callback);
  }

  public disconnectError(callback: ListenAuthDisconnectErrorCallback): void {
    this.eventManager.on(AUTH_DISCONNECT_ERROR, callback);
  }
}
