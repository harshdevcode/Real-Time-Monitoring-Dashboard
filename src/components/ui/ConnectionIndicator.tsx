"use client";
import { useInfraStore } from "@/store/infraStore";
import type { ConnectionStatus } from "@/services/wsClient";

const config: Record<ConnectionStatus, { dot: string; label: string; glow: string }> = {
  connected:    { dot: "bg-[#00e676]", label: "LIVE",         glow: "shadow-[0_0_6px_#00e676]" },
  connecting:   { dot: "bg-[#ffc107] animate-pulse", label: "CONNECTING", glow: "shadow-[0_0_6px_#ffc107]" },
  disconnected: { dot: "bg-[#4a5568]", label: "OFFLINE",      glow: "" },
  error:        { dot: "bg-[#ff5252] animate-pulse", label: "ERROR",       glow: "shadow-[0_0_6px_#ff5252]" },
};

export function ConnectionIndicator() {
  const status = useInfraStore((s) => s.connectionStatus);
  const { dot, label, glow } = config[status];

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8892a4]">
      <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${dot} ${glow}`} />
      WS:{label}
    </div>
  );
}
