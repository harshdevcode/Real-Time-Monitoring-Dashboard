"use client";
import { useEffect } from "react";
import { WsClient } from "@/services/wsClient";
import { useInfraStore } from "@/store/infraStore";
import type { ServerMessage } from "@/lib/protocol";

/**
 * WsProvider mounts once at the root layout.
 * It connects the singleton WsClient, registers the store's action handlers
 * as message listeners, and tears everything down on unmount.
 *
 * When the active tenant changes in the store, we call wsClient.setTenant()
 * so the server automatically sends unsubscribe → subscribe → snapshot.
 */
export function WsProvider() {
  const activeTenant       = useInfraStore((s) => s.activeTenant);
  const setConnectionStatus = useInfraStore((s) => s.setConnectionStatus);
  const applyMetricTick    = useInfraStore((s) => s.applyMetricTick);
  const applySnapshot      = useInfraStore((s) => s.applySnapshot);
  const setNodes           = useInfraStore((s) => s.setNodes);
  const setServices        = useInfraStore((s) => s.setServices);
  const appendLog          = useInfraStore((s) => s.appendLog);
  const setLogs            = useInfraStore((s) => s.setLogs);
  const addAlert           = useInfraStore((s) => s.addAlert);
  const setAlerts          = useInfraStore((s) => s.setAlerts);

  // ── Connect on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    const ws = WsClient.getInstance();

    const unsubMsg = ws.onMessage((msg: ServerMessage) => {
      switch (msg.type) {
        case "connected":
          // Server ack — version logged for debugging
          console.log("[ws] server version:", msg.serverVersion);
          break;

        case "snapshot": {
          const last = msg.history.at(-1);
          applySnapshot(
            msg.history,
            last?.cpu        ?? 0,
            last?.mem        ?? 0,
            last?.rps        ?? 0,
            last?.errorRate  ?? 0,
            last?.latencyP99 ?? 0
          );
          setNodes(msg.nodes);
          setServices(msg.services);
          setLogs(msg.logs);
          setAlerts(msg.alerts);
          break;
        }

        case "metric_tick":
          applyMetricTick(msg.point);
          setNodes(msg.nodes);
          setServices(msg.services);
          break;

        case "log_line":
          appendLog(msg.entry);
          break;

        case "alert":
          addAlert(msg.alert);
          break;
      }
    });

    const unsubStatus = ws.onStatusChange(setConnectionStatus);

    ws.connect();

    return () => {
      unsubMsg();
      unsubStatus();
      ws.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── React to tenant changes ────────────────────────────────────────────────
  useEffect(() => {
    WsClient.getInstance().setTenant(activeTenant);
  }, [activeTenant]);

  return null;
}
