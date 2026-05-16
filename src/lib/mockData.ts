import type {
  Tenant,
  InfraNode,
  Service,
  MetricPoint,
  TrafficSegment,
  LogEntry,
  Alert,
} from "@/types";
import { format, subMinutes } from "date-fns";

// ─── Tenants ──────────────────────────────────────────────────────────────────
export const TENANTS: Tenant[] = [
  { id: "prod-us-east", label: "PROD-US-EAST", region: "us-east-1", color: "#00e676" },
  { id: "staging",      label: "STAGING",      region: "us-west-2", color: "#00b8d4" },
  { id: "prod-eu-west", label: "PROD-EU-WEST", region: "eu-west-1", color: "#ffc107" },
];

// ─── Nodes ────────────────────────────────────────────────────────────────────
export const NODES: InfraNode[] = [
  { id: "n01", name: "node-01", status: "ok",   region: "us-east-1", cpu: 28, mem: 51 },
  { id: "n02", name: "node-02", status: "ok",   region: "us-east-1", cpu: 33, mem: 62 },
  { id: "n03", name: "node-03", status: "ok",   region: "us-east-1", cpu: 19, mem: 44 },
  { id: "n04", name: "node-04", status: "ok",   region: "us-west-2", cpu: 41, mem: 58 },
  { id: "n05", name: "node-05", status: "warn", region: "us-west-2", cpu: 78, mem: 71 },
  { id: "n06", name: "node-06", status: "ok",   region: "us-west-2", cpu: 22, mem: 39 },
  { id: "n07", name: "node-07", status: "ok",   region: "eu-west-1", cpu: 35, mem: 66 },
  { id: "n08", name: "node-08", status: "ok",   region: "eu-west-1", cpu: 27, mem: 53 },
  { id: "n09", name: "node-09", status: "warn", region: "eu-west-1", cpu: 87, mem: 82 },
  { id: "n10", name: "node-10", status: "ok",   region: "ap-south-1", cpu: 14, mem: 33 },
  { id: "n11", name: "node-11", status: "ok",   region: "ap-south-1", cpu: 31, mem: 49 },
  { id: "n12", name: "node-12", status: "ok",   region: "ap-south-1", cpu: 22, mem: 45 },
];

// ─── Services ─────────────────────────────────────────────────────────────────
export const SERVICES: Service[] = [
  { name: "api-gateway",    replicas: "4/4", cpu: 22, mem: 48, p99: "18ms",  status: "ok",   trend: "stable" },
  { name: "auth-service",   replicas: "2/2", cpu: 11, mem: 34, p99: "9ms",   status: "ok",   trend: "down"   },
  { name: "data-ingestion", replicas: "6/6", cpu: 67, mem: 71, p99: "84ms",  status: "warn", trend: "up"     },
  { name: "ml-inference",   replicas: "3/3", cpu: 81, mem: 88, p99: "112ms", status: "warn", trend: "up"     },
  { name: "notifier",       replicas: "2/2", cpu: 8,  mem: 22, p99: "7ms",   status: "ok",   trend: "stable" },
  { name: "cache-proxy",    replicas: "4/4", cpu: 14, mem: 55, p99: "3ms",   status: "ok",   trend: "down"   },
  { name: "job-scheduler",  replicas: "1/1", cpu: 5,  mem: 18, p99: "—",     status: "ok",   trend: "stable" },
  { name: "metrics-sink",   replicas: "2/2", cpu: 33, mem: 41, p99: "29ms",  status: "ok",   trend: "stable" },
];

// ─── Traffic Mix ──────────────────────────────────────────────────────────────
export const TRAFFIC_SEGMENTS: TrafficSegment[] = [
  { label: "api-gateway", value: 38, color: "#00e676" },
  { label: "auth-svc",    value: 22, color: "#00b8d4" },
  { label: "ml-infer",    value: 18, color: "#448aff" },
  { label: "ingestion",   value: 14, color: "#ffc107" },
  { label: "other",       value: 8,  color: "#4a5568" },
];

// ─── Metric History ───────────────────────────────────────────────────────────
function rnd(base: number, spread: number) {
  return Math.max(0, Math.min(100, base + (Math.random() - 0.5) * spread * 2));
}

export function generateHistory(points = 30): MetricPoint[] {
  const now = new Date();
  return Array.from({ length: points }, (_, i) => ({
    ts: format(subMinutes(now, points - 1 - i), "HH:mm"),
    cpu: rnd(34, 18),
    mem: rnd(61, 8),
    rps: rnd(4800, 900),
    errorRate: rnd(0.12, 0.06),
    latencyP99: rnd(42, 18),
  }));
}

// ─── Log Templates ────────────────────────────────────────────────────────────
const LOG_TEMPLATES = [
  { level: "INFO" as const, service: "api-gateway",    message: "health check passed → 200 OK" },
  { level: "INFO" as const, service: "cache-proxy",    message: "cache hit ratio 94.2% — redis nominal" },
  { level: "WARN" as const, service: "node-09",        message: "cpu 87.3% — scaling policy triggered" },
  { level: "INFO" as const, service: "api-gateway",    message: "deployed v2.4.12 — zero downtime" },
  { level: "OK"   as const, service: "orchestrator",   message: "auto-scale complete — 2 pods joined pool" },
  { level: "WARN" as const, service: "ml-inference",   message: "p99 spike on /api/v2/predict → 112ms" },
  { level: "INFO" as const, service: "data-ingestion", message: "pipeline processed 41k events/sec" },
  { level: "INFO" as const, service: "cert-manager",   message: "ssl cert renewal ok — expires 2025-02-14" },
  { level: "ERR"  as const, service: "ml-inference",   message: "timeout — retrying (attempt 1/3)" },
  { level: "OK"   as const, service: "ml-inference",   message: "retry succeeded — response 214ms" },
  { level: "INFO" as const, service: "backup-agent",   message: "snapshot completed — s3://infra-backups" },
  { level: "WARN" as const, service: "node-05",        message: "disk usage 78% — threshold 80%" },
  { level: "INFO" as const, service: "auth-service",   message: "token cache purged — 14k entries cleared" },
  { level: "ERR"  as const, service: "metrics-sink",   message: "write timeout — prometheus scrape delayed" },
  { level: "OK"   as const, service: "metrics-sink",   message: "reconnected — metrics pipeline nominal" },
];

let logCounter = 0;
export function generateLogEntry(): LogEntry {
  const tpl = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
  return {
    id: `log-${Date.now()}-${logCounter++}`,
    ts: format(new Date(), "HH:mm:ss"),
    level: tpl.level,
    service: tpl.service,
    message: tpl.message,
  };
}

export function generateInitialLogs(count = 14): LogEntry[] {
  return Array.from({ length: count }, generateLogEntry);
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const INITIAL_ALERTS: Alert[] = [
  {
    id: "alert-001",
    severity: "warning",
    title: "High CPU — eu-west-1 / node-09",
    message: "CPU sustained above 87% for 5 minutes. Auto-scaling triggered 3m ago — 2 new pods joining.",
    ts: format(subMinutes(new Date(), 3), "HH:mm:ss"),
    dismissed: false,
  },
  {
    id: "alert-002",
    severity: "warning",
    title: "Elevated latency — ml-inference",
    message: "P99 latency at 112ms, above SLO threshold of 100ms. Investigate upstream GPU contention.",
    ts: format(subMinutes(new Date(), 7), "HH:mm:ss"),
    dismissed: false,
  },
];
