import { format } from "date-fns";
import type {
  TenantId,
  MetricPoint,
  NodeState,
  ServiceState,
  LogEntry,
  AlertPayload,
} from "./protocol";

// ─────────────────────────────────────────────────────────────────────────────
// Each tenant has its own TenantEngine that holds independent state and
// advances it on every tick. This means prod-us-east and staging diverge
// realistically instead of mirroring each other.
// ─────────────────────────────────────────────────────────────────────────────

function nudge(val: number, spread: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val + (Math.random() - 0.5) * spread * 2));
}

function rnd(base: number, spread: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, base + (Math.random() - 0.5) * spread * 2));
}

// ── Seed values differ per tenant so dashboards look distinct ─────────────────
const TENANT_SEEDS: Record<TenantId, { cpu: number; mem: number; rps: number; err: number; lat: number }> = {
  "prod-us-east": { cpu: 34, mem: 61, rps: 4821, err: 0.12, lat: 42 },
  "staging":      { cpu: 18, mem: 44, rps: 890,  err: 0.55, lat: 68 },
  "prod-eu-west": { cpu: 51, mem: 72, rps: 3200, err: 0.21, lat: 55 },
};

const LOG_TEMPLATES: Array<{ level: LogEntry["level"]; service: string; message: string }> = [
  { level: "INFO", service: "api-gateway",    message: "health check passed → 200 OK" },
  { level: "INFO", service: "cache-proxy",    message: "cache hit ratio 94.2% — redis nominal" },
  { level: "WARN", service: "node-09",        message: "cpu sustained above threshold — scaling triggered" },
  { level: "INFO", service: "api-gateway",    message: "deployed v2.4.12 — zero downtime rollout complete" },
  { level: "OK",   service: "orchestrator",   message: "auto-scale complete — 2 new pods joined node pool" },
  { level: "WARN", service: "ml-inference",   message: "p99 spike on /api/v2/predict → 112ms (SLO: 100ms)" },
  { level: "INFO", service: "data-ingestion", message: "pipeline processed 41k events/sec — buffer nominal" },
  { level: "INFO", service: "cert-manager",   message: "ssl cert renewal ok — expires 2025-02-14" },
  { level: "ERR",  service: "ml-inference",   message: "upstream timeout — retrying (attempt 1/3)" },
  { level: "OK",   service: "ml-inference",   message: "retry succeeded — response 214ms" },
  { level: "INFO", service: "backup-agent",   message: "incremental snapshot completed → s3://infra-backups" },
  { level: "WARN", service: "node-05",        message: "disk usage 78% — threshold 80%" },
  { level: "INFO", service: "auth-service",   message: "token cache purged — 14k entries cleared" },
  { level: "ERR",  service: "metrics-sink",   message: "write timeout — prometheus scrape delayed 2s" },
  { level: "OK",   service: "metrics-sink",   message: "reconnected to prometheus — pipeline nominal" },
  { level: "INFO", service: "job-scheduler",  message: "cron job db-vacuum completed in 1.2s" },
  { level: "WARN", service: "notifier",       message: "smtp relay latency 340ms — above 300ms SLO" },
  { level: "INFO", service: "api-gateway",    message: "rate limit applied to client 203.0.113.42 (burst)" },
];

let globalLogSeq = 0;

export class TenantEngine {
  readonly tenantId: TenantId;

  // Current live values (random-walked each tick)
  private cpu: number;
  private mem: number;
  private rps: number;
  private err: number;
  private lat: number;

  // Circular history buffer — always 30 points
  private history: MetricPoint[] = [];

  // Node + service state — mutated occasionally for realism
  private nodes: NodeState[];
  private services: ServiceState[];
  private logs: LogEntry[] = [];
  private alerts: AlertPayload[] = [];

  constructor(tenantId: TenantId) {
    this.tenantId = tenantId;
    const s = TENANT_SEEDS[tenantId];
    this.cpu = s.cpu;
    this.mem = s.mem;
    this.rps = s.rps;
    this.err = s.err;
    this.lat = s.lat;

    // Seed history
    for (let i = 0; i < 30; i++) {
      this.history.push(this.makePoint());
      this.advanceLightly();
    }

    this.nodes = this.buildNodes();
    this.services = this.buildServices();
    this.logs = Array.from({ length: 20 }, () => this.makeLog());
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /** Advance one tick. Returns the new MetricPoint + updated nodes/services. */
  tick(): { point: MetricPoint; nodes: NodeState[]; services: ServiceState[] } {
    this.advance();
    this.jitterNodes();
    this.jitterServices();

    return {
      point: this.currentPoint(),
      nodes: this.nodes,
      services: this.services,
    };
  }

  makeLog(): LogEntry {
    const tpl = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
    return {
      id: `${this.tenantId}-log-${++globalLogSeq}`,
      ts: format(new Date(), "HH:mm:ss"),
      level: tpl.level,
      service: tpl.service,
      message: tpl.message,
    };
  }

  /** Check thresholds and maybe produce an alert (returns null if nothing fired) */
  checkAlerts(): AlertPayload | null {
    if (this.cpu > 88 && Math.random() < 0.3) {
      return {
        id: `alert-${Date.now()}`,
        severity: "warning",
        title: `High CPU — ${this.tenantId}`,
        message: `Cluster CPU at ${this.cpu.toFixed(1)}% — auto-scaling policy evaluating.`,
        ts: format(new Date(), "HH:mm:ss"),
      };
    }
    if (this.err > 1.2 && Math.random() < 0.4) {
      return {
        id: `alert-${Date.now()}`,
        severity: "critical",
        title: `Error rate spike — ${this.tenantId}`,
        message: `Error rate ${this.err.toFixed(2)}% above SLO (1.0%). Investigate api-gateway upstream.`,
        ts: format(new Date(), "HH:mm:ss"),
      };
    }
    return null;
  }

  snapshot() {
    return {
      history: [...this.history],
      nodes: this.nodes,
      services: this.services,
      logs: [...this.logs.slice(-30)],
      alerts: this.alerts,
    };
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private advance() {
    this.cpu = nudge(this.cpu, 3,   10, 95);
    this.mem = nudge(this.mem, 1.5, 45, 90);
    this.rps = nudge(this.rps, 200, 200, 9000);
    this.err = nudge(this.err, 0.06, 0, 3);
    this.lat = nudge(this.lat, 4,   8, 180);

    const p = this.currentPoint();
    this.history = [...this.history.slice(1), p];
  }

  private advanceLightly() {
    this.cpu = nudge(this.cpu, 2, 10, 95);
    this.mem = nudge(this.mem, 1, 45, 90);
    this.rps = nudge(this.rps, 100, 200, 9000);
    this.err = nudge(this.err, 0.02, 0, 3);
    this.lat = nudge(this.lat, 2, 8, 180);
  }

  private makePoint(): MetricPoint {
    return {
      ts: format(new Date(), "HH:mm"),
      cpu: +this.cpu.toFixed(1),
      mem: +this.mem.toFixed(1),
      rps: Math.round(this.rps),
      errorRate: +this.err.toFixed(3),
      latencyP99: Math.round(this.lat),
    };
  }

  private currentPoint(): MetricPoint {
    return this.makePoint();
  }

  private jitterNodes() {
    this.nodes = this.nodes.map((n) => {
      const cpu = nudge(n.cpu, 2, 5, 98);
      const mem = nudge(n.mem, 1, 20, 95);
      const status: NodeState["status"] =
        cpu > 85 || mem > 90 ? "warn" : cpu > 95 ? "err" : "ok";
      return { ...n, cpu: +cpu.toFixed(1), mem: +mem.toFixed(1), status };
    });
  }

  private jitterServices() {
    this.services = this.services.map((s) => {
      const cpu = nudge(s.cpu, 3, 2, 98);
      const mem = nudge(s.mem, 2, 10, 95);
      const prevLat = parseFloat(s.p99) || 10;
      const lat = nudge(prevLat, 5, 2, 200);
      const status: ServiceState["status"] =
        cpu > 80 || mem > 85 ? "warn" : cpu > 92 ? "err" : "ok";
      const trend: ServiceState["trend"] =
        cpu > s.cpu + 3 ? "up" : cpu < s.cpu - 3 ? "down" : "stable";
      return {
        ...s,
        cpu: +cpu.toFixed(1),
        mem: +mem.toFixed(1),
        p99: `${Math.round(lat)}ms`,
        status,
        trend,
      };
    });
  }

  private buildNodes(): NodeState[] {
    const regions: Record<TenantId, string[]> = {
      "prod-us-east": ["us-east-1", "us-east-2"],
      "staging":      ["us-west-2"],
      "prod-eu-west": ["eu-west-1", "eu-central-1"],
    };
    const regs = regions[this.tenantId];
    return Array.from({ length: 12 }, (_, i) => ({
      id: `${this.tenantId}-n${String(i + 1).padStart(2, "0")}`,
      name: `node-${String(i + 1).padStart(2, "0")}`,
      status: "ok" as const,
      region: regs[i % regs.length],
      cpu: rnd(30, 20),
      mem: rnd(55, 15),
    }));
  }

  private buildServices(): ServiceState[] {
    return [
      { name: "api-gateway",    replicas: "4/4", cpu: rnd(22, 8), mem: rnd(48, 8), p99: "18ms",  status: "ok", trend: "stable" },
      { name: "auth-service",   replicas: "2/2", cpu: rnd(11, 4), mem: rnd(34, 6), p99: "9ms",   status: "ok", trend: "stable" },
      { name: "data-ingestion", replicas: "6/6", cpu: rnd(67, 10),mem: rnd(71, 6), p99: "84ms",  status: "warn",trend:"up" },
      { name: "ml-inference",   replicas: "3/3", cpu: rnd(81, 5), mem: rnd(88, 4), p99: "112ms", status: "warn",trend:"up" },
      { name: "notifier",       replicas: "2/2", cpu: rnd(8, 3),  mem: rnd(22, 4), p99: "7ms",   status: "ok", trend: "stable" },
      { name: "cache-proxy",    replicas: "4/4", cpu: rnd(14, 4), mem: rnd(55, 5), p99: "3ms",   status: "ok", trend: "down" },
      { name: "job-scheduler",  replicas: "1/1", cpu: rnd(5, 2),  mem: rnd(18, 3), p99: "—",     status: "ok", trend: "stable" },
      { name: "metrics-sink",   replicas: "2/2", cpu: rnd(33, 8), mem: rnd(41, 6), p99: "29ms",  status: "ok", trend: "stable" },
    ];
  }
}
