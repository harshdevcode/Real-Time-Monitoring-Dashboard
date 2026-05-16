// ─────────────────────────────────────────────────────────────────────────────
// This file is a copy of server/src/protocol.ts
// Keep both in sync — or move to a shared package if the repo grows.
// ─────────────────────────────────────────────────────────────────────────────

export type TenantId = "prod-us-east" | "staging" | "prod-eu-west";

// ── Inbound (client → server) ─────────────────────────────────────────────────
export interface SubscribeMsg      { type: "subscribe";        tenant: TenantId }
export interface UnsubscribeMsg    { type: "unsubscribe";      tenant: TenantId }
export interface SnapshotRequestMsg{ type: "snapshot_request"; tenant: TenantId }
export type ClientMessage = SubscribeMsg | UnsubscribeMsg | SnapshotRequestMsg;

// ── Outbound (server → client) ────────────────────────────────────────────────
export interface MetricPoint {
  ts: string;
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

export interface MetricTickMsg {
  type: "metric_tick";
  tenant: TenantId;
  point: MetricPoint;
  nodes: NodeState[];
  services: ServiceState[];
}

export interface LogLineMsg {
  type: "log_line";
  tenant: TenantId;
  entry: LogEntry;
}

export interface AlertMsg {
  type: "alert";
  tenant: TenantId;
  alert: AlertPayload;
}

export interface SnapshotMsg {
  type: "snapshot";
  tenant: TenantId;
  history: MetricPoint[];
  nodes: NodeState[];
  services: ServiceState[];
  logs: LogEntry[];
  alerts: AlertPayload[];
}

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
