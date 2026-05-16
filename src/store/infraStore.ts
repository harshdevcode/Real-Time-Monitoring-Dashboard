import { create } from "zustand";
import { format } from "date-fns";
import type {
  TenantId,
  MetricPoint,
  NodeState,
  ServiceState,
  LogEntry,
  AlertPayload,
} from "@/lib/protocol";
import type { ConnectionStatus } from "@/services/wsClient";
import { generateHistory } from "@/lib/mockData";

export interface LiveMetrics {
  cpu: number;
  mem: number;
  rps: number;
  errorRate: number;
  latencyP99: number;
  history: MetricPoint[];
}

export interface Alert extends AlertPayload {
  dismissed: boolean;
}

interface InfraStore {
  activeTenant: TenantId;
  setTenant: (id: TenantId) => void;

  activeView: string;
  setView: (v: string) => void;

  connectionStatus: ConnectionStatus;
  setConnectionStatus: (s: ConnectionStatus) => void;
  serverVersion: string;

  metrics: LiveMetrics;
  tickMetrics: () => void;
  applyMetricTick: (point: MetricPoint) => void;
  applySnapshot: (history: MetricPoint[], cpu: number, mem: number, rps: number, err: number, lat: number) => void;

  nodes: NodeState[];
  setNodes: (nodes: NodeState[]) => void;

  services: ServiceState[];
  setServices: (services: ServiceState[]) => void;

  logs: LogEntry[];
  appendLog: (entry: LogEntry) => void;
  setLogs: (logs: LogEntry[]) => void;

  alerts: Alert[];
  addAlert: (alert: AlertPayload) => void;
  dismissAlert: (id: string) => void;
  setAlerts: (alerts: AlertPayload[]) => void;
}

export const useInfraStore = create<InfraStore>((set, get) => ({
  activeTenant: "prod-us-east",
  setTenant: (id) => set({ activeTenant: id }),

  activeView: "overview",
  setView: (v) => set({ activeView: v }),

  connectionStatus: "disconnected",
  setConnectionStatus: (s) => set({ connectionStatus: s }),
  serverVersion: "",

  metrics: {
    cpu: 34,
    mem: 61,
    rps: 4821,
    errorRate: 0.12,
    latencyP99: 42,
    history: generateHistory(30),
  },

tickMetrics: () => {
    const m = get().metrics;
    const nextPoint: MetricPoint = {
      ts: format(new Date(), "HH:mm"),
      cpu: Math.max(0, Math.min(100, m.cpu + (Math.random() - 0.5) * 10)),
      mem: Math.max(0, Math.min(100, m.mem + (Math.random() - 0.5) * 6)),
      rps: Math.max(0, m.rps + (Math.random() - 0.5) * 300),
      errorRate: Math.max(0, Math.min(100, m.errorRate + (Math.random() - 0.5) * 0.06)),
      latencyP99: Math.max(0, Math.min(100, m.latencyP99 + (Math.random() - 0.5) * 10)),
    };
    set({
      metrics: {
        cpu: nextPoint.cpu,
        mem: nextPoint.mem,
        rps: nextPoint.rps,
        errorRate: nextPoint.errorRate,
        latencyP99: nextPoint.latencyP99,
        history: [...m.history.slice(1), nextPoint],
      },
    });
  },

  applyMetricTick: (point) => {
    const m = get().metrics;
    set({
      metrics: {
        cpu:        point.cpu,
        mem:        point.mem,
        rps:        point.rps,
        errorRate:  point.errorRate,
        latencyP99: point.latencyP99,
        history:    [...m.history.slice(1), point],
      },
    });
  },

  applySnapshot: (history, cpu, mem, rps, err, lat) => {
    set({ metrics: { cpu, mem, rps, errorRate: err, latencyP99: lat, history } });
  },

  nodes: [],
  setNodes: (nodes) => set({ nodes }),

  services: [],
  setServices: (services) => set({ services }),

  logs: [],
  appendLog: (entry) => set((s) => ({ logs: [...s.logs.slice(-59), entry] })),
  setLogs: (logs) => set({ logs }),

  alerts: [],
  addAlert: (alert) => set((s) => ({ alerts: [...s.alerts, { ...alert, dismissed: false }] })),
  dismissAlert: (id) => set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, dismissed: true } : a)) })),
  setAlerts: (alerts) => set({ alerts: alerts.map((a) => ({ ...a, dismissed: false })) }),
}));
