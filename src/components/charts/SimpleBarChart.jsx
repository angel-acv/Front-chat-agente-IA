import React from "react";

/**
 * SimpleBarChart
 * props:
 *  - data: Array<{ label: string, value: number }>
 *  - height?: number
 *  - color?: string
 */
export default function SimpleBarChart({ data = [], height = 220, color = "#2563eb" }) {
  const width = 600;
  const padding = { top: 16, right: 16, bottom: 36, left: 34 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxV = Math.max(1, ...data.map((d) => d.value));
  const barW = data.length ? innerW / data.length - 8 : 0;

  const scaleX = (i) => padding.left + i * (innerW / Math.max(1, data.length));
  const scaleY = (v) => padding.top + innerH - (v / maxV) * innerH;

  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
        const y = padding.top + innerH * (1 - p);
        return <line key={idx} x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="grid" />;
      })}

      {/* Axes */}
      <line x1={padding.left} x2={padding.left} y1={padding.top} y2={height - padding.bottom} className="axis" />
      <line x1={padding.left} x2={width - padding.right} y1={height - padding.bottom} y2={height - padding.bottom} className="axis" />

      {/* Bars */}
      {data.map((d, i) => {
        const x = scaleX(i) + 4;
        const y = scaleY(d.value);
        const h = padding.top + innerH - y;
        return <rect key={i} x={x} y={y} width={barW} height={h} className="bar" style={{ fill: color }} rx="6" />;
      })}

      {/* Labels */}
      {data.map((d, i) => {
        const x = scaleX(i) + barW / 2 + 4;
        return (
          <text key={i} x={x} y={height - 10} fontSize="10" fill="#64748b" textAnchor="middle">
            {d.label.length > 8 ? d.label.slice(0, 8) + "…" : d.label}
          </text>
        );
      })}
    </svg>
  );
}