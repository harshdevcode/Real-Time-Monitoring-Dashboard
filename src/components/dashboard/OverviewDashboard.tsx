"use client";
import { useInfraStore } from "@/store/infraStore";
import { StatCards } from "@/components/dashboard/StatCards";
import { ServicesTable } from "@/components/dashboard/ServicesTable";
import { LogStream } from "@/components/dashboard/LogStream";
import { MetricChart } from "@/components/charts/MetricChart";
import { TrafficDonut } from "@/components/charts/TrafficDonut";
import { AlertStrip } from "@/components/ui/AlertStrip";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";

export function OverviewDashboard() {
  const alerts   = useInfraStore((s) => s.alerts);
  const history  = useInfraStore((s) => s.metrics.history);
  const logs     = useInfraStore((s) => s.logs);
  const services = useInfraStore((s) => s.services);

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  return (
    <div className="flex flex-col gap-4">

      {/* Alerts */}
      {activeAlerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {activeAlerts.map((a) => (
            <AlertStrip key={a.id} alert={a} />
          ))}
        </div>
      )}

      {/* Stat cards */}
      <StatCards />

      {/* Charts row */}
      <div className="grid grid-cols-[2fr_1fr] gap-3">
        <Panel>
          <PanelHeader
            title="CPU & MEMORY — 30 MIN"
            right={
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#4a5568]">
                  <span className="w-[10px] h-[2px] bg-[#00e676] inline-block rounded" />
                  CPU
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#4a5568]">
                  <span className="w-[10px] h-[2px] bg-[#00b8d4] inline-block rounded" />
                  MEM
                </span>
                <Badge variant="green">LIVE</Badge>
              </div>
            }
          />
          <MetricChart history={history} />
        </Panel>

        <Panel>
          <PanelHeader
            title="TRAFFIC MIX"
            right={<Badge variant="green">LIVE</Badge>}
          />
          <TrafficDonut />
        </Panel>
      </div>

      {/* Services + Logs */}
      <div className="grid grid-cols-[2fr_1fr] gap-3">
        <Panel noPad>
          <PanelHeader
            title="SERVICES"
            right={<Badge variant="blue">{services.length} running</Badge>}
            bordered
          />
          <ServicesTable services={services} />
        </Panel>

        <Panel noPad>
          <PanelHeader
            title={
              <span className="flex items-center gap-1">
                LOG STREAM
                <span className="inline-block w-[7px] h-[13px] bg-[#00e676] animate-[blink_1.1s_infinite] align-middle ml-0.5" />
              </span>
            }
            right={<Badge variant="green">STREAMING</Badge>}
            bordered
          />
          <LogStream logs={logs} />
        </Panel>
      </div>

    </div>
  );
}
