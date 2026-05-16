import type {
  TenantId,
  ServerMessage,
  ClientMessage,
} from "@/lib/protocol";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4001";

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

type MessageHandler = (msg: ServerMessage) => void;
type StatusHandler  = (status: ConnectionStatus) => void;

export class WsClient {
  private static instance: WsClient | null = null;
  static getInstance(): WsClient {
    if (!WsClient.instance) WsClient.instance = new WsClient();
    return WsClient.instance;
  }

  private ws: WebSocket | null = null;
  private activeTenant: TenantId | null = null;
  private messageHandlers = new Set<MessageHandler>();
  private statusHandlers  = new Set<StatusHandler>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private shouldReconnect = true;
  private _status: ConnectionStatus = "disconnected";

  private constructor() {}

  get status() { return this._status; }

  connect() {
    if (this.ws && this.ws.readyState <= 1) return;
    this.openSocket();
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }

  setTenant(tenant: TenantId) {
    if (this.activeTenant === tenant) return;
    if (this.activeTenant && this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: "unsubscribe", tenant: this.activeTenant });
    }
    this.activeTenant = tenant;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: "subscribe", tenant });
    }
  }

  requestSnapshot(tenant: TenantId) {
    this.send({ type: "snapshot_request", tenant });
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatusChange(handler: StatusHandler) {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  private openSocket() {
    this.setStatus("connecting");
    console.log("[ws] connecting to " + WS_URL);
    try {
      this.ws = new WebSocket(WS_URL);
    } catch (err) {
      console.error("[ws] failed to construct WebSocket:", err);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log("[ws] connected");
      this.reconnectDelay = 1000;
      this.setStatus("connected");
      if (this.activeTenant) {
        this.send({ type: "subscribe", tenant: this.activeTenant });
      }
    };

    this.ws.onmessage = (event) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(event.data as string) as ServerMessage;
      } catch {
        console.warn("[ws] failed to parse message");
        return;
      }
      for (const handler of this.messageHandlers) handler(msg);
    };

    this.ws.onclose = (event) => {
      console.log("[ws] closed (code: " + event.code + ")");
      this.setStatus("disconnected");
      if (this.shouldReconnect) this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.setStatus("error");
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    console.log("[ws] reconnecting in " + this.reconnectDelay + "ms");
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.openSocket();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30_000);
  }

  private send(msg: ClientMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private setStatus(s: ConnectionStatus) {
    this._status = s;
    for (const h of this.statusHandlers) h(s);
  }
}
