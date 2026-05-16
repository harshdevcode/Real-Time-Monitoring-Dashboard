// ─── WebSocket Message Protocol ───────────────────────────────────────────────
// Shared types used by both the Node.js server and the Next.js client.

export type WsMessageType =
  | "SUBSCRIBE"
  | "UNSUBSCRIBE"
  | "METRICS_TICK"
  | "LOG_ENTRY"
  | "ALERT"
  | "NODE_STATUS"
  | "PING"
  | "PONG"
  | "ERROR";

// ─── Client → Server ──────────────────────────────────────────────────────────
export interface WsSubscribeMsg {
  type: "SUBSCRIBE";
  tenant: string;
  channels: WsChannel[];
}

export interface WsUnsubscribeMsg {
  type: "UNSUBSCRIBE";
  channels: WsChannel[];
}

export interface WsPingMsg {
  type: "PING";
}

export type WsClientMessage = WsSubscribeMsg | WsUnsubscribeMsg | WsPingMsg;

// ─── Server → Client ──────────────────────────────────────────────────────────
export type WsChannel = "metrics" | "logs" | "alerts" | "nodes";

export interface WsMetricsTick {
  type: "METRICS_TICK";
  tenant: string;
  ts: string;
  data: {
    cpu: number;
    mem: number;
    rps: number;
    errorRate: number;
    latencyP99: number;
    diskIo: number;
    networkIn: number;
    networkOut: number;
  };
}

export interface WsLogEntry {
  type: "LOG_ENTRY";
  tenant: string;
  data: {
    id: string;
    ts: string;
    level: "INFO" | "WARN" | "ERR" | "OK";
    service: string;
    message: string;
    traceId?: string;
  };
}

export interface WsAlert {
  type: "ALERT";
  tenant: string;
  data: {
    id: string;
    severity: "critical" | "warning" | "info";
    title: string;
    message: string;
    ts: string;
  };
}

export interface WsNodeStatus {
  type: "NODE_STATUS";
  tenant: string;
  data: {
    id: string;
    name: string;
    status: "ok" | "warn" | "err";
    cpu: number;
    mem: number;
    region: string;
  };
}

export interface WsPongMsg {
  type: "PONG";
  ts: string;
}

export interface WsErrorMsg {
  type: "ERROR";
  code: string;
  message: string;
}

export type WsServerMessage =
  | WsMetricsTick
  | WsLogEntry
  | WsAlert
  | WsNodeStatus
  | WsPongMsg
  | WsErrorMsg;
