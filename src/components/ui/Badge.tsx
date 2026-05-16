import { cn } from "@/lib/utils";

type Variant = "green" | "cyan" | "amber" | "red" | "blue" | "gray";

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

const styles: Record<Variant, string> = {
  green: "bg-[#00e67614] text-[#00e676] border-[#00e67630]",
  cyan:  "bg-[#00b8d414] text-[#00b8d4] border-[#00b8d430]",
  amber: "bg-[#ffc10714] text-[#ffc107] border-[#ffc10730]",
  red:   "bg-[#ff525214] text-[#ff5252] border-[#ff525230]",
  blue:  "bg-[#448aff14] text-[#448aff] border-[#448aff30]",
  gray:  "bg-[#4a556814] text-[#8892a4] border-[#4a556830]",
};

export function Badge({ variant = "gray", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border text-[10px] px-[7px] py-[2px] rounded-[2px] font-mono tracking-wide",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
