import { toSparkPoints } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({ data, color, width = 80, height = 36, className }: SparklineProps) {
  if (data.length < 2) return null;
  const points = toSparkPoints(data, width, height);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
