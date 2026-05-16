"use client";
import { useEffect, useRef } from "react";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
} from "chart.js";
import type { TrafficSegment } from "@/types";
import { TRAFFIC_SEGMENTS } from "@/lib/mockData";

Chart.register(DoughnutController, ArcElement, Tooltip);

export function TrafficDonut() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const chart = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: TRAFFIC_SEGMENTS.map((s: TrafficSegment) => s.label),
        datasets: [
          {
            data: TRAFFIC_SEGMENTS.map((s: TrafficSegment) => s.value),
            backgroundColor: TRAFFIC_SEGMENTS.map((s: TrafficSegment) => s.color),
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#141820",
            borderColor: "#1e2535",
            borderWidth: 1,
            titleColor: "#8892a4",
            bodyColor: "#e8eaf0",
            titleFont: { family: "JetBrains Mono", size: 10 },
            bodyFont: { family: "JetBrains Mono", size: 11 },
            callbacks: {
              label: (ctx) => ` ${ctx.parsed}% of traffic`,
            },
          },
        },
      },
    });
    return () => chart.destroy();
  }, []);

  return (
    <div>
      <div className="relative h-[180px]">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Donut chart showing traffic distribution across services"
        />
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
        {TRAFFIC_SEGMENTS.map((s: TrafficSegment) => (
          <span key={s.label} className="flex items-center gap-1 text-[10px] text-[#8892a4] font-mono">
            <span
              className="w-[8px] h-[8px] rounded-[1px] flex-shrink-0"
              style={{ background: s.color }}
            />
            {s.label} {s.value}%
          </span>
        ))}
      </div>
    </div>
  );
}
