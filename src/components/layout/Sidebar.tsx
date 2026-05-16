"use client";
import { useInfraStore } from "@/store/infraStore";
import { cn } from "@/lib/utils";
import type { InfraNode } from "@/types";

const NAV_ITEMS = [
  { id: "overview",  icon: "▤", label: "Overview"  },
  { id: "topology",  icon: "⬡", label: "Topology"  },
  { id: "traces",    icon: "⧖", label: "Traces"    },
  { id: "alerts",    icon: "◈", label: "Alerts"    },
  { id: "logs",      icon: "≡", label: "Logs"      },
];

const REGIONS = [
  { name: "us-east-1",  status: "ok"   },
  { name: "us-west-2",  status: "ok"   },
  { name: "eu-west-1",  status: "warn" },
  { name: "ap-south-1", status: "ok"   },
];

const statusDot: Record<string, string> = {
  ok:   "bg-[#00e676]",
  warn: "bg-[#ffc107]",
  err:  "bg-[#ff5252]",
};

function NodeItem({ node }: { node: InfraNode }) {
  return (
    <div className="flex items-center justify-between px-2 py-[5px] rounded-[3px] hover:bg-[#141820] transition-colors cursor-pointer">
      <span className="text-[11px] text-[#8892a4] font-mono">{node.name}</span>
      <span className={cn("w-[6px] h-[6px] rounded-full flex-shrink-0", statusDot[node.status])} />
    </div>
  );
}

export function Sidebar() {
  const activeView = useInfraStore((s) => s.activeView);
  const setView    = useInfraStore((s) => s.setView);
  const nodes      = useInfraStore((s) => s.nodes);

  const okCount = nodes.filter((n) => n.status === "ok").length;

  return (
    <nav
      className="bg-[#0f1216] border-r border-[#1e2535] flex flex-col gap-0 overflow-y-auto"
      aria-label="Sidebar navigation"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#2a3348 transparent" }}
    >
      {/* Nav section */}
      <div className="px-4 pt-4 pb-2">
        <div className="text-[10px] text-[#4a5568] tracking-[0.12em] uppercase mb-2 px-1">Views</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-[7px] rounded text-[12px] font-mono transition-all duration-150 border text-left",
              activeView === item.id
                ? "bg-[#00e67614] border-[#00e67640] text-[#00e676]"
                : "bg-transparent border-transparent text-[#8892a4] hover:bg-[#141820] hover:text-[#e8eaf0]"
            )}
          >
            <span className="text-[14px] w-[18px] text-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Nodes section */}
      <div className="px-4 py-2 border-t border-[#1e2535]">
        <div className="text-[10px] text-[#4a5568] tracking-[0.12em] uppercase mb-2 px-1 flex items-center gap-2">
          Nodes
          <span className="text-[#00e676]">{okCount}/{nodes.length}</span>
        </div>
        {nodes.map((n) => (
          <NodeItem key={n.id} node={n} />
        ))}
      </div>

      {/* Regions section */}
      <div className="px-4 py-2 border-t border-[#1e2535]">
        <div className="text-[10px] text-[#4a5568] tracking-[0.12em] uppercase mb-2 px-1">Regions</div>
        {REGIONS.map((r) => (
          <div key={r.name} className="flex items-center justify-between px-2 py-[5px] rounded hover:bg-[#141820] cursor-pointer">
            <span className="text-[11px] text-[#8892a4] font-mono">{r.name}</span>
            <span className={cn("w-[6px] h-[6px] rounded-full", statusDot[r.status])} />
          </div>
        ))}
      </div>
    </nav>
  );
}
