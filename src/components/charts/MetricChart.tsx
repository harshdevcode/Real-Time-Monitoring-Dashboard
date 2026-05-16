"use client";
import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from "chart.js";
import type { MetricPoint } from "@/types";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 },
  interaction: { mode: "index" as const, intersect: false },
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
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#4a5568",
        font: { family: "JetBrains Mono", size: 9 },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8,
      },
      grid: { color: "#1a2030" },
      border: { color: "#1e2535" },
    },
    y: {
      min: 0,
      max: 100,
      ticks: {
        color: "#4a5568",
        font: { family: "JetBrains Mono", size: 9 },
        callback: (v: number | string) => v + "%",
      },
      grid: { color: "#1a2030" },
      border: { color: "#1e2535" },
    },
  },
};

interface MetricChartProps {
  history: MetricPoint[];
}

export function MetricChart({ history }: MetricChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: history.map((p) => p.ts),
        datasets: [
          {
            label: "CPU %",
            data: history.map((p) => Math.round(p.cpu)),
            borderColor: "#00e676",
            backgroundColor: "#00e67608",
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
          },
          {
            label: "MEM %",
            data: history.map((p) => Math.round(p.mem)),
            borderColor: "#00b8d4",
            backgroundColor: "#00b8d408",
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: CHART_OPTIONS,
    });
    return () => chartRef.current?.destroy();
  }, []); // eslint-disable-line

  // Live update without re-mounting
  useEffect(() => {
    const c = chartRef.current;
    if (!c) return;
    c.data.labels = history.map((p) => p.ts);
    c.data.datasets[0].data = history.map((p) => Math.round(p.cpu));
    c.data.datasets[1].data = history.map((p) => Math.round(p.mem));
    c.update("none");
  }, [history]);

  return (
    <div className="relative h-[200px]">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Line chart showing real-time CPU and memory usage over 30 minutes"
      />
    </div>
  );
}
