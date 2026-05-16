"use client";
import { Sparkline } from "./Sparkline";

type AccentColor = "green" | "cyan" | "amber" | "red";

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  accent: AccentColor;
  sparkData: number[];
}

const accentMap: Record<AccentColor, { top: string; text: string; sparkColor: string }> = {
  green: { top: "#00e676", text: "text-[#00e676]", sparkColor: "#00e676" },
  cyan:  { top: "#00b8d4", text: "text-[#00b8d4]", sparkColor: "#00b8d4" },
  amber: { top: "#ffc107", text: "text-[#ffc107]", sparkColor: "#ffc107" },
  red:   { top: "#ff5252", text: "text-[#ff5252]", sparkColor: "#ff5252" },
};

export function StatCard({ label, value, sub, accent, sparkData }: StatCardProps) {
  const { top, text, sparkColor } = accentMap[accent];
  return (
    <div className="relative bg-[#0f1216] border border-[#1e2535] rounded-md p-4 overflow-hidden hover:border-[#2a3348] transition-colors duration-200">
      {/* top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: top }} />

      <div className="text-[10px] text-[#4a5568] tracking-[0.08em] uppercase mb-2">{label}</div>
      <div className={`text-[26px] font-semibold font-mono leading-none mb-1 ${text}`}>
        {value}
      </div>
      <div className="text-[11px] text-[#4a5568] font-mono">{sub}</div>

      {/* sparkline */}
      <div className="absolute bottom-0 right-0 opacity-40">
        <Sparkline data={sparkData} color={sparkColor} />
      </div>
    </div>
  );
}
