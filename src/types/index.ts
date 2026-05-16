// ─── Tenant / Environment ─────────────────────────────────────────────────────
export type TenantId = "prod-us-east" | "staging" | "prod-eu-west";

export interface Tenant {
  id: TenantId;
  label: string;
  region: string;
  color: string;
}

// ─── Node ─────────────────────────────────────────────────────────────────────
export type NodeStatus = "ok" | "warn" | "err";

export interface InfraNode {
  id: string;
  name: string;
  status: NodeStatus;
  region: string;
  cpu: number;
  mem: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────
export interface Service {
  name: string;
  replicas: string;
  cpu: number;
  mem: number;
  p99: string;
  status: "ok" | "warn" | "err";
  trend: "up" | "down" | "stable";
}

// ─── Metrics ──────────────────────────────────────────────────────────────────
export interface MetricPoint {
  ts: string;
  cpu: number;
  mem: number;
  rps: number;
  errorRate: number;
  latencyP99: number;
}

export interface LiveMetrics {
  cpu: number;
  mem: number;
  rps: number;
  errorRate: number;
  latencyP99: number;
  history: MetricPoint[];
}

// ─── Logs ─────────────────────────────────────────────────────────────────────
export type LogLevel = "INFO" | "WARN" | "ERR" | "OK";

export interface LogEntry {
  id: string;
  ts: string;
  level: LogLevel;
  service: string;
  message: string;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
export interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  ts: string;
  dismissed: boolean;
}

// ─── Traffic ─────────────────────────────────────────────────────────────────
export interface TrafficSegment {
  label: string;
  value: number;
  color: string;
}
