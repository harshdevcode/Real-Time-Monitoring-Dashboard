"use client";
import { useInfraStore } from "@/store/infraStore";
import { useClock } from "@/hooks/useClock";
import { ConnectionIndicator } from "@/components/ui/ConnectionIndicator";
import { TENANTS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import type { TenantId } from "@/lib/protocol";

export function TopBar() {
  const activeTenant = useInfraStore((s) => s.activeTenant);
  const setTenant    = useInfraStore((s) => s.setTenant);
  const alerts       = useInfraStore((s) => s.alerts);
  const time         = useClock();

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  return (
    <header className="flex items-center justify-between px-5 h-12 bg-[#0f1216] border-b border-[#1e2535] sticky top-0 z-50 flex-shrink-0">

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e676]" />
          </span>
          <span className="text-[14px] font-semibold font-mono tracking-[0.05em] text-[#00e676]">
            INFRAWATCH
          </span>
          <span className="text-[11px] font-mono text-[#4a5568] ml-1">/ v2.4.1</span>
        </div>

        <div className="flex gap-1">
          {TENANTS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTenant(t.id as TenantId)}
              className={cn(
                "border text-[11px] font-mono px-[10px] py-[4px] rounded-[3px] tracking-[0.04em] cursor-pointer transition-all duration-150",
                activeTenant === t.id
                  ? "bg-[#00b8d420] border-[#00b8d4] text-[#00b8d4]"
                  : "bg-transparent border-[#2a3348] text-[#8892a4] hover:border-[#00b8d4] hover:text-[#00b8d4]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Live WS connection badge */}
        <ConnectionIndicator />

        {activeAlerts.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8892a4]">
            <span className="w-[6px] h-[6px] rounded-full bg-[#ffc107] shadow-[0_0_6px_#ffc107]" />
            {activeAlerts.length} ALERT{activeAlerts.length > 1 ? "S" : ""}
          </div>
        )}
        <span className="text-[12px] font-mono text-[#4a5568]">{time} UTC</span>
      </div>
    </header>
  );
}
