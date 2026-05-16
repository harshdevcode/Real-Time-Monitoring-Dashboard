import { cn } from "@/lib/utils";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  noPad?: boolean;
}

export function Panel({ children, className, noPad }: PanelProps) {
  return (
    <div
      className={cn(
        "bg-[#0f1216] border border-[#1e2535] rounded-md",
        !noPad && "p-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface PanelHeaderProps {
  title: React.ReactNode;
  right?: React.ReactNode;
  bordered?: boolean;
}

export function PanelHeader({ title, right, bordered }: PanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        bordered
          ? "px-4 py-3 border-b border-[#1e2535] bg-[#141820]"
          : "mb-3"
      )}
    >
      <span className="text-[12px] font-medium text-[#e8eaf0] tracking-[0.04em] font-mono">
        {title}
      </span>
      {right && <div>{right}</div>}
    </div>
  );
}
