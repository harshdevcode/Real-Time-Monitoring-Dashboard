import type WebSocket from "ws";
import type { TenantId } from "./protocol";

// ─────────────────────────────────────────────────────────────────────────────
// Tracks which WebSocket clients are subscribed to which tenant.
// A single client can only be subscribed to one tenant at a time
// (they unsubscribe on tenant switch).
// ─────────────────────────────────────────────────────────────────────────────

export class SubscriptionRegistry {
  private map = new Map<TenantId, Set<WebSocket>>();

  subscribe(tenant: TenantId, ws: WebSocket) {
    if (!this.map.has(tenant)) this.map.set(tenant, new Set());
    this.map.get(tenant)!.add(ws);
    console.log(`[registry] +1 subscriber to ${tenant} (total: ${this.map.get(tenant)!.size})`);
  }

  unsubscribe(tenant: TenantId, ws: WebSocket) {
    this.map.get(tenant)?.delete(ws);
    console.log(`[registry] -1 subscriber from ${tenant}`);
  }

  /** Remove a disconnected client from every tenant */
  remove(ws: WebSocket) {
    for (const [tenant, clients] of this.map) {
      if (clients.delete(ws)) {
        console.log(`[registry] removed disconnected client from ${tenant}`);
      }
    }
  }

  /** Broadcast a JSON payload to all subscribers of a tenant */
  broadcast(tenant: TenantId, payload: object) {
    const clients = this.map.get(tenant);
    if (!clients || clients.size === 0) return;

    const data = JSON.stringify(payload);
    let sent = 0;
    for (const ws of clients) {
      if (ws.readyState === 1 /* OPEN */) {
        ws.send(data);
        sent++;
      }
    }
    return sent;
  }

  subscriberCount(tenant: TenantId) {
    return this.map.get(tenant)?.size ?? 0;
  }

  allTenants(): TenantId[] {
    return [...this.map.keys()];
  }
}
