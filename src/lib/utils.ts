import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Return tailwind-compatible color key based on numeric threshold */
export function thresholdColor(value: number): "green" | "amber" | "red" {
  if (value > 80) return "red";
  if (value > 60) return "amber";
  return "green";
}

/** Format a number with thousands separator */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

/** Build SVG polyline points from a number array */
export function toSparkPoints(
  data: number[],
  width = 80,
  height = 36,
  padding = 2
): string {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
