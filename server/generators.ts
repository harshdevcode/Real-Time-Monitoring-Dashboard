import { format } from "date-fns";
import { v4 as uuid } from "uuid";

// ─── Per-tenant baseline config ───────────────────────────────────────────────
const TENANT_BASELINES: Record<string, { cpu: number; mem: number; rps: number; errorRate: number }> = {
  "prod-us-east": { cpu: 34, mem: 61, rps: 4800, errorRate: 0.12 },
  "staging":      { cpu: 18, mem: 42, rps: 820,  errorRate: 0.04 },
  "prod-eu-west": { cpu: 55, mem: 70, rps: 2900,  errorRate: 0.31 },
};

// ─── Random walk state per tenant ────────────────────────────────────────────
const state: Record<string, ReturnType<typeof makeState>> = {};

function makeState(baseline: { cpu: number; mem: number; rps: number; errorRate: number }) {
  return {
    cpu: baseline.cpu,
    mem: baseline.mem,
    rps: baseline.rps,
    errorRate: baseline.errorRate,
    latencyP99: 42,
    diskIo: 28,
    networkIn: 145,
    networkOut: 88,
  };
}

function nudge(val: number, drift: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val + (Math.random() - 0.5) * drift * 2));
}

export function getTenantMetricTick(tenant: string) {
  const baseline = TENANT_BASELINES[tenant] ?? TENANT_BASELINES["prod-us-east"];
  if (!state[tenant]) state[tenant] = makeState(baseline);

  const s = state[tenant];
  s.cpu        = nudge(s.cpu,        3,   5,  95);
  s.mem        = nudge(s.mem,        1.5, 20, 90);
  s.rps        = nudge(s.rps,        250, 100, 12000);
  s.errorRate  = nudge(s.errorRate,  0.05, 0,  3);
  s.latencyP99 = nudge(s.latencyP99, 5,   5,  200);
  s.diskIo     = nudge(s.diskIo,     4,   0,  100);
  s.networkIn  = nudge(s.networkIn,  10,  0,  1000);
  s.networkOut = nudge(s.networkOut, 8,   0,  600);

  return {
    ts: format(new Date(), "HH:mm:ss"),
    data: {
      cpu:         +s.cpu.toFixed(1),
      mem:         +s.mem.toFixed(1),
      rps:         Math.round(s.rps),
      errorRate:   +s.errorRate.toFixed(3),
      latencyP99:  Math.round(s.latencyP99),
      diskIo:      +s.diskIo.toFixed(1),
      networkIn:   +s.networkIn.toFixed(1),
      networkOut:  +s.networkOut.toFixed(1),
    },
  };
}

// ─── Log generator ────────────────────────────────────────────────────────────
const LOG_TEMPLATES = [
  { level: "INFO" as const, service: "api-gateway",    message: "health check passed → 200 OK" },
  { level: "INFO" as const, service: "cache-proxy",    message: "cache hit ratio 94.2% — redis nominal" },
  { level: "WARN" as const, service: "node-09",        message: "cpu 87.3% — scaling policy triggered" },
  { level: "INFO" as const, service: "api-gateway",    message: "deployed v2.4.12 — zero downtime" },
  { level: "OK"   as const, service: "orchestrator",   message: "auto-scale complete — 2 pods joined pool" },
  { level: "WARN" as const, service: "ml-inference",   message: "p99 spike on /api/v2/predict → 112ms" },
  { level: "INFO" as const, service: "data-ingestion", message: "pipeline processed 41k events/sec" },
  { level: "ERR"  as const, service: "ml-inference",   message: "timeout — retrying (attempt 1/3)" },
  { level: "OK"   as const, service: "ml-inference",   message: "retry succeeded — response 214ms" },
  { level: "INFO" as const, service: "backup-agent",   message: "snapshot completed — s3://infra-backups" },
  { level: "WARN" as const, service: "node-05",        message: "disk usage 78% — threshold 80%" },
  { level: "ERR"  as const, service: "metrics-sink",   message: "write timeout — prometheus scrape delayed" },
  { level: "OK"   as const, service: "metrics-sink",   message: "reconnected — metrics pipeline nominal" },
];

export function generateLogEntry(tenant: string) {
  const tpl = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
  return {
    id: uuid(),
    ts: format(new Date(), "HH:mm:ss"),
    level: tpl.level,
    service: tpl.service,
    message: tpl.message,
    traceId: `tr-${uuid().slice(0, 8)}`,
    tenant,
  };
}

// ─── Node status generator ────────────────────────────────────────────────────
const BASE_NODES = [
  { id: "n01", name: "node-01", region: "us-east-1" },
  { id: "n02", name: "node-02", region: "us-east-1" },
  { id: "n03", name: "node-03", region: "us-east-1" },
  { id: "n04", name: "node-04", region: "us-west-2" },
  { id: "n05", name: "node-05", region: "us-west-2" },
  { id: "n06", name: "node-06", region: "eu-west-1" },
  { id: "n07", name: "node-07", region: "eu-west-1" },
  { id: "n08", name: "node-08", region: "ap-south-1" },
];

export function generateNodeStatus(tenant: string) {
  const node = BASE_NODES[Math.floor(Math.random() * BASE_NODES.length)];
  const cpu = Math.round(nudge(40, 35, 5, 95));
  const mem = Math.round(nudge(55, 20, 20, 90));
  return {
    ...node,
    status: (cpu > 85 ? "warn" : cpu > 95 ? "err" : "ok") as "ok" | "warn" | "err",
    cpu,
    mem,
    tenant,
  };
}
