"use client";
import { useEffect, useRef } from "react";
import type { LogEntry, LogLevel } from "@/types";
import { Badge } from "@/components/ui/Badge";

const levelBadge: Record<LogLevel, "cyan" | "amber" | "red" | "green"> = {
  INFO: "cyan",
  WARN: "amber",
  ERR:  "red",
  OK:   "green",
};

interface LogStreamProps {
  logs: LogEntry[];
}

export function LogStream({ logs }: LogStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={scrollRef}
      className="h-[220px] overflow-y-auto text-[11px] font-mono py-1"
      aria-live="polite"
      aria-label="Real-time log stream"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#2a3348 transparent" }}
    >
      {logs.map((entry) => (
        <div
          key={entry.id}
          className="flex items-start gap-2 px-4 py-[3px] hover:bg-[#141820] transition-colors"
        >
          <span className="text-[#4a5568] flex-shrink-0 w-[60px]">{entry.ts}</span>
          <Badge variant={levelBadge[entry.level]} className="flex-shrink-0 w-[38px] justify-center">
            {entry.level}
          </Badge>
          <span className="text-[#4a5568] flex-shrink-0 w-[110px] truncate">{entry.service}</span>
          <span className="text-[#8892a4]">{entry.message}</span>
        </div>
      ))}
    </div>
  );
}
