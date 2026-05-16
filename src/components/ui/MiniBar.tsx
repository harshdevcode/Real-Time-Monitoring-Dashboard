import { thresholdColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MiniBarProps {
  value: number;
  className?: string;
}

const fillColors = {
  green: "bg-[#00e676]",
  amber: "bg-[#ffc107]",
  red:   "bg-[#ff5252]",
};

export function MiniBar({ value, className }: MiniBarProps) {
  const color = thresholdColor(value);
  return (
    <div className={cn("h-[4px] bg-[#1a2030] rounded-sm overflow-hidden mt-[3px]", className)}>
      <div
        className={cn("h-full rounded-sm transition-all duration-700", fillColors[color])}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}
