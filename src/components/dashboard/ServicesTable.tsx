import type { Service } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { MiniBar } from "@/components/ui/MiniBar";
import { thresholdColor } from "@/lib/utils";

const textColorMap = {
  green: "text-[#00e676]",
  amber: "text-[#ffc107]",
  red:   "text-[#ff5252]",
};

const trendIcon = { up: "↑", down: "↓", stable: "—" };
const trendColor = {
  up:     "text-[#ff5252]",
  down:   "text-[#00e676]",
  stable: "text-[#4a5568]",
};

interface ServicesTableProps {
  services: Service[];
}

export function ServicesTable({ services }: ServicesTableProps) {
  return (
    <table className="w-full border-collapse text-[12px] font-mono" aria-label="Service status">
      <thead>
        <tr>
          {["Service", "Replicas", "CPU", "Memory", "P99", "Trend", "Status"].map((h) => (
            <th
              key={h}
              className="text-[10px] text-[#4a5568] text-left px-3 py-2 border-b border-[#1e2535] tracking-[0.06em] uppercase font-normal"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {services.map((svc) => {
          const cpuColor = thresholdColor(svc.cpu);
          const memColor = thresholdColor(svc.mem);
          return (
            <tr key={svc.name} className="group hover:bg-[#141820] transition-colors">
              <td className="px-3 py-2 border-b border-[#1a2030] text-[#e8eaf0] font-medium">
                {svc.name}
              </td>
              <td className="px-3 py-2 border-b border-[#1a2030] text-[#8892a4]">
                {svc.replicas}
              </td>
              <td className="px-3 py-2 border-b border-[#1a2030] min-w-[70px]">
                <div className={textColorMap[cpuColor]}>{svc.cpu}%</div>
                <MiniBar value={svc.cpu} />
              </td>
              <td className="px-3 py-2 border-b border-[#1a2030] min-w-[70px]">
                <div className={textColorMap[memColor]}>{svc.mem}%</div>
                <MiniBar value={svc.mem} />
              </td>
              <td className="px-3 py-2 border-b border-[#1a2030] text-[#4a5568]">
                {svc.p99}
              </td>
              <td className={`px-3 py-2 border-b border-[#1a2030] ${trendColor[svc.trend]}`}>
                {trendIcon[svc.trend]}
              </td>
              <td className="px-3 py-2 border-b border-[#1a2030]">
                <Badge variant={svc.status === "ok" ? "green" : svc.status === "warn" ? "amber" : "red"}>
                  {svc.status.toUpperCase()}
                </Badge>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
