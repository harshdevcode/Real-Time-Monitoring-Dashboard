"use client";
import { useEffect, useRef } from "react";
import { useInfraStore } from "@/store/infraStore";
import { generateLogEntry } from "@/lib/mockData";

/**
 * Drives the live simulation — ticks metrics every 2s, appends logs every ~1.5s.
 * Mount once at the root layout; safe to call multiple times (uses a ref guard).
 */
export function useLiveSimulation() {
  const tickMetrics = useInfraStore((s) => s.tickMetrics);
  const appendLog = useInfraStore((s) => s.appendLog);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const metricTimer = setInterval(tickMetrics, 2000);

    let logTimeout: ReturnType<typeof setTimeout>;
    function scheduleLog() {
      logTimeout = setTimeout(() => {
        appendLog(generateLogEntry());
        scheduleLog();
      }, 1200 + Math.random() * 800);
    }
    scheduleLog();

    return () => {
      clearInterval(metricTimer);
      clearTimeout(logTimeout);
    };
  }, [tickMetrics, appendLog]);
}
