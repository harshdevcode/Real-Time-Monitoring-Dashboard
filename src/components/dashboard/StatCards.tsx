"use client";
import { useInfraStore } from "@/store/infraStore";
import { StatCard } from "@/components/ui/StatCard";
import { formatNumber } from "@/lib/utils";

export function StatCards() {
  const { cpu, mem, rps, errorRate, latencyP99, history } = useInfraStore((s) => s.metrics);

  const cpuHistory  = history.map((p) => p.cpu);
  const memHistory  = history.map((p) => p.mem);
  const rpsHistory  = history.map((p) => p.rps);
  const errHistory  = history.map((p) => p.errorRate);

  return (
    <div className="grid grid-cols-4 gap-3">
      <StatCard
        label="Avg CPU"
        value={`${Math.round(cpu)}%`}
        sub={`cluster avg · ${cpu > 70 ? "↑ high" : "nominal"}`}
        accent="green"
        sparkData={cpuHistory}
      />
      <StatCard
        label="Memory Used"
        value={`${Math.round(mem)}%`}
        sub="67.4 GB / 110 GB"
        accent="cyan"
        sparkData={memHistory}
      />
      <StatCard
        label="Req / sec"
        value={formatNumber(rps)}
        sub={`p99 latency · ${Math.round(latencyP99)}ms`}
        accent="green"
        sparkData={rpsHistory}
      />
      <StatCard
        label="Error Rate"
        value={`${errorRate.toFixed(2)}%`}
        sub={`~${Math.round(errorRate * rps / 100 * 60)} errors / min`}
        accent={errorRate > 0.5 ? "red" : "amber"}
        sparkData={errHistory}
      />
    </div>
  );
}
