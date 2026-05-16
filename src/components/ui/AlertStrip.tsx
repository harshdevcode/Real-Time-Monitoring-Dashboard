import type { Alert } from "@/types";
import { useInfraStore } from "@/store/infraStore";

interface AlertStripProps {
  alert: Alert;
}

const severityStyles = {
  warning:  "bg-[#ffc10710] border-[#ffc10740] text-[#ffc107]",
  critical: "bg-[#ff525210] border-[#ff525240] text-[#ff5252]",
  info:     "bg-[#448aff10] border-[#448aff40] text-[#448aff]",
};

export function AlertStrip({ alert }: AlertStripProps) {
  const dismiss = useInfraStore((s) => s.dismissAlert);
  if (alert.dismissed) return null;

  return (
    <div
      className={`flex items-start gap-3 border rounded-md px-4 py-3 text-[11px] font-mono ${severityStyles[alert.severity]}`}
      role="alert"
    >
      <span className="text-[15px] mt-[1px] flex-shrink-0">⚠</span>
      <div className="flex-1">
        <span className="font-medium">{alert.title}</span>
        <span className="text-[10px] opacity-70 ml-2">{alert.ts}</span>
        <div className="mt-[2px] opacity-80">{alert.message}</div>
      </div>
      <button
        onClick={() => dismiss(alert.id)}
        className="text-[16px] leading-none opacity-40 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none"
        aria-label="Dismiss alert"
      >
        ✕
      </button>
    </div>
  );
}
