// ─────────────────────────────────────────────────────────────────────────────
// Wire protocol — every message sent over the WebSocket conforms to WsMessage.
// Both the Node server and Next.js client import from this single file so
// the shape is always in sync.
// ─────────────────────────────────────────────────────────────────────────────

export type TenantId = "prod-us-east" | "staging" | "prod-eu-west";

// ── Inbound (client → server) ─────────────────────────────────────────────────

/** Client subscribes to a tenant channel */
export interface SubscribeMsg {
  type: "subscribe";
  tenant: TenantId;
}

/** Client unsubscribes (before switching tenant) */
export interface UnsubscribeMsg {
  type: "unsubscribe";
  tenant: TenantId;
}

/** Client requests a full snapshot of current state */
export interface SnapshotRequestMsg {
  type: "snapshot_request";
  tenant: TenantId;
}

export type ClientMessage = SubscribeMsg | UnsubscribeMsg | SnapshotRequestMsg;

// ── Outbound (server → client) ────────────────────────────────────────────────

export interface MetricPoint {
  ts: string;          // "HH:mm"
  cpu: number;
  mem: number;
  rps: number;
  errorRate: number;
  latencyP99: number;
}

export interface NodeState {
  id: string;
  name: string;
  status: "ok" | "warn" | "err";
  region: string;
  cpu: number;
  mem: number;
}

export interface ServiceState {
  name: string;
  replicas: string;
  cpu: number;
  mem: number;
  p99: string;
  status: "ok" | "warn" | "err";
  trend: "up" | "down" | "stable";
}

export interface LogEntry {
  id: string;
  ts: string;
  level: "INFO" | "WARN" | "ERR" | "OK";
  service: string;
  message: string;
}

export interface AlertPayload {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  ts: string;
}

/** Sent every 2 s — live metric tick */
export interface MetricTickMsg {
  type: "metric_tick";
  tenant: TenantId;
  point: MetricPoint;
  nodes: NodeState[];
  services: ServiceState[];
}

/** Sent every ~1.5 s — new log line */
export interface LogLineMsg {
  type: "log_line";
  tenant: TenantId;
  entry: LogEntry;
}

/** Fired when a threshold is crossed */
export interface AlertMsg {
  type: "alert";
  tenant: TenantId;
  alert: AlertPayload;
}

/** Full state dump — sent on connect / snapshot_request */
export interface SnapshotMsg {
  type: "snapshot";
  tenant: TenantId;
  history: MetricPoint[];   // last 30 points
  nodes: NodeState[];
  services: ServiceState[];
  logs: LogEntry[];          // last 30 entries
  alerts: AlertPayload[];
}

/** Server → client connection acknowledgement */
export interface ConnectedMsg {
  type: "connected";
  serverVersion: string;
  ts: string;
}

export type ServerMessage =
  | MetricTickMsg
  | LogLineMsg
  | AlertMsg
  | SnapshotMsg
  | ConnectedMsg;
