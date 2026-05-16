import { WebSocketServer, WebSocket, type RawData } from "ws";
import { IncomingMessage } from "http";
import {
  WsClientMessage,
  WsServerMessage,
  WsChannel,
} from "./protocol";
import {
  getTenantMetricTick,
  generateLogEntry,
  generateNodeStatus,
} from "./generators";

const PORT = Number(process.env.WS_PORT ?? 4001);

// ─── Client state ─────────────────────────────────────────────────────────────
interface ClientState {
  ws: WebSocket;
  tenant: string;
  channels: Set<WsChannel>;
  ip: string;
  connectedAt: Date;
}

const clients = new Map<WebSocket, ClientState>();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function send(ws: WebSocket, msg: WsServerMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function broadcast(tenant: string, channel: WsChannel, msg: WsServerMessage) {
  for (const [ws, state] of clients) {
    if (state.tenant === tenant && state.channels.has(channel)) {
      send(ws, msg);
    }
  }
}

// ─── Server ───────────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  const ip = req.socket.remoteAddress ?? "unknown";
  console.log(`[ws] client connected — ${ip}`);

  // Default subscription: prod-us-east, all channels
  const clientState: ClientState = {
    ws,
    tenant: "prod-us-east",
    channels: new Set(["metrics", "logs", "alerts", "nodes"]),
    ip,
    connectedAt: new Date(),
  };
  clients.set(ws, clientState);

  ws.on("message", (raw: RawData) => {
    let msg: WsClientMessage;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      send(ws, { type: "ERROR", code: "INVALID_JSON", message: "Could not parse message" });
      return;
    }

    switch (msg.type) {
      case "SUBSCRIBE":
        clientState.tenant = msg.tenant;
        clientState.channels = new Set(msg.channels);
        console.log(`[ws] ${ip} subscribed → tenant=${msg.tenant} channels=${msg.channels.join(",")}`);
        break;

      case "UNSUBSCRIBE":
        for (const ch of msg.channels) clientState.channels.delete(ch);
        break;

      case "PING":
        send(ws, { type: "PONG", ts: new Date().toISOString() });
        break;
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`[ws] client disconnected — ${ip}`);
  });

  ws.on("error", (err: Error) => {
    console.error(`[ws] error — ${ip}:`, err.message);
  });
});

// ─── Metric broadcast loop (2s) ───────────────────────────────────────────────
const TENANTS = ["prod-us-east", "staging", "prod-eu-west"];

setInterval(() => {
  for (const tenant of TENANTS) {
    const tick = getTenantMetricTick(tenant);
    broadcast(tenant, "metrics", {
      type: "METRICS_TICK",
      tenant,
      ...tick,
    });
  }
}, 2000);

// ─── Log broadcast loop (~1.4s randomised) ───────────────────────────────────
function scheduleLog() {
  setTimeout(() => {
    for (const tenant of TENANTS) {
      const entry = generateLogEntry(tenant);
      broadcast(tenant, "logs", {
        type: "LOG_ENTRY",
        tenant,
        data: entry,
      });
    }
    scheduleLog();
  }, 1000 + Math.random() * 800);
}
scheduleLog();

// ─── Node status broadcast (5s) ───────────────────────────────────────────────
setInterval(() => {
  for (const tenant of TENANTS) {
    const node = generateNodeStatus(tenant);
    broadcast(tenant, "nodes", {
      type: "NODE_STATUS",
      tenant,
      data: node,
    });
  }
}, 5000);

console.log(`\n🚀 InfraWatch WebSocket server running on ws://localhost:${PORT}\n`);
