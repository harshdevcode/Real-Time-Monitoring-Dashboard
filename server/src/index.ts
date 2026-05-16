import { WebSocketServer, WebSocket } from "ws";
import { format } from "date-fns";
import { TenantEngine } from "./tenantEngine";
import { SubscriptionRegistry } from "./subscriptionRegistry";
import type {
  TenantId,
  ClientMessage,
  ConnectedMsg,
  MetricTickMsg,
  LogLineMsg,
  AlertMsg,
  SnapshotMsg,
} from "./protocol";

// ─── Config ───────────────────────────────────────────────────────────────────
const PORT = Number(process.env.WS_PORT ?? 4001);
const METRIC_INTERVAL_MS  = 2000;
const LOG_INTERVAL_BASE   = 1200;
const LOG_INTERVAL_JITTER = 800;
const SERVER_VERSION = "2.4.1";

const TENANTS: TenantId[] = ["prod-us-east", "staging", "prod-eu-west"];

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const wss      = new WebSocketServer({ port: PORT });
const registry = new SubscriptionRegistry();

// One engine per tenant — they run independently
const engines = new Map<TenantId, TenantEngine>(
  TENANTS.map((id) => [id, new TenantEngine(id)])
);

console.log(`[server] InfraWatch WS server starting on ws://localhost:${PORT}`);

// ─── Connection handler ───────────────────────────────────────────────────────
wss.on("connection", (ws: WebSocket, req) => {
  const ip = req.socket.remoteAddress ?? "unknown";
  console.log(`[server] new connection from ${ip} — total: ${wss.clients.size}`);

  // Send an immediate ack so the client knows the socket is alive
  const ack: ConnectedMsg = {
    type: "connected",
    serverVersion: SERVER_VERSION,
    ts: format(new Date(), "HH:mm:ss"),
  };
  ws.send(JSON.stringify(ack));

  // ── Inbound message handler ───────────────────────────────────────────────
  ws.on("message", (raw) => {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw.toString()) as ClientMessage;
    } catch {
      console.warn("[server] malformed message from client:", raw.toString().slice(0, 100));
      return;
    }

    switch (msg.type) {
      case "subscribe": {
        registry.subscribe(msg.tenant, ws);
        // Immediately send a snapshot so the client hydrates without waiting for the first tick
        sendSnapshot(ws, msg.tenant);
        break;
      }

      case "unsubscribe": {
        registry.unsubscribe(msg.tenant, ws);
        break;
      }

      case "snapshot_request": {
        sendSnapshot(ws, msg.tenant);
        break;
      }

      default:
        console.warn("[server] unknown message type:", (msg as { type: string }).type);
    }
  });

  ws.on("close", () => {
    registry.remove(ws);
    console.log(`[server] client disconnected — remaining: ${wss.clients.size}`);
  });

  ws.on("error", (err) => {
    console.error("[server] ws error:", err.message);
    registry.remove(ws);
  });
});

// ─── Per-tenant metric tick ───────────────────────────────────────────────────
// All tenants tick on the same interval but produce independent data
setInterval(() => {
  for (const [tenantId, engine] of engines) {
    // Skip if no one is subscribed — saves CPU
    if (registry.subscriberCount(tenantId) === 0) continue;

    const { point, nodes, services } = engine.tick();

    const tick: MetricTickMsg = {
      type: "metric_tick",
      tenant: tenantId,
      point,
      nodes,
      services,
    };
    registry.broadcast(tenantId, tick);

    // Opportunistically check if a threshold was crossed
    const alert = engine.checkAlerts();
    if (alert) {
      const alertMsg: AlertMsg = {
        type: "alert",
        tenant: tenantId,
        alert,
      };
      registry.broadcast(tenantId, alertMsg);
      console.log(`[server] alert fired for ${tenantId}: ${alert.title}`);
    }
  }
}, METRIC_INTERVAL_MS);

// ─── Per-tenant log stream ────────────────────────────────────────────────────
// Logs fire on a jittered interval to feel realistic
function scheduleLog() {
  const delay = LOG_INTERVAL_BASE + Math.random() * LOG_INTERVAL_JITTER;
  setTimeout(() => {
    for (const [tenantId, engine] of engines) {
      if (registry.subscriberCount(tenantId) === 0) continue;

      const logMsg: LogLineMsg = {
        type: "log_line",
        tenant: tenantId,
        entry: engine.makeLog(),
      };
      registry.broadcast(tenantId, logMsg);
    }
    scheduleLog(); // reschedule
  }, delay);
}
scheduleLog();

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sendSnapshot(ws: WebSocket, tenantId: TenantId) {
  const engine = engines.get(tenantId);
  if (!engine) return;

  const snap = engine.snapshot();
  const msg: SnapshotMsg = {
    type: "snapshot",
    tenant: tenantId,
    ...snap,
  };
  ws.send(JSON.stringify(msg));
  console.log(`[server] snapshot sent for ${tenantId}`);
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────
process.on("SIGTERM", () => {
  console.log("[server] SIGTERM received — closing server");
  wss.close(() => {
    console.log("[server] closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n[server] SIGINT — shutting down");
  wss.close(() => process.exit(0));
});

wss.on("listening", () => {
  console.log(`[server] ✓ listening on ws://localhost:${PORT}`);
  console.log(`[server] tenants: ${TENANTS.join(", ")}`);
  console.log(`[server] metric interval: ${METRIC_INTERVAL_MS}ms`);
});
