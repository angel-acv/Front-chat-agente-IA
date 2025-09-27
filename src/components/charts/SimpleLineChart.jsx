import React from "react";

/**
 * SimpleLineChart
 * props:
 *  - data: Array<{ x: string|number|Date, y: number }>
 *  - height?: number
 *  - color?: string
 *  - yMax?: number
 *  - yMin?: number
 *  - yTicks?: number
 */
export default function SimpleLineChart({ data = [], height = 220, color = "#2563eb", yMin, yMax, yTicks = 4 }) {
  const width = 600; // SVG internal width; container scales automatically
  const padding = { top: 16, right: 16, bottom: 26, left: 34 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const xs = data.map((d, i) => i);
  const ys = data.map((d) => d.y);
  const minY = yMin != null ? yMin : (ys.length ? Math.min(...ys) : 0);
  const maxY = yMax != null ? yMax : (ys.length ? Math.max(...ys) : 1);

  const scaleX = (i) => padding.left + (innerW * (i / Math.max(1, xs.length - 1)));
  const scaleY = (v) => padding.top + innerH - ((v - minY) / Math.max(1e-6, (maxY - minY))) * innerH;

  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(d.y)}`).join(" ");

  // Grid + ticks
  const ticks = [];
  for (let t = 0; t <= yTicks; t++) {
    const v = minY + ((maxY - minY) * t) / yTicks;
    ticks.push({ v, y: scaleY(v) });
  }

  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {/* Grid */}
      {ticks.map((tk, idx) => (
        <line key={idx} x1={padding.left} x2={width - padding.right} y1={tk.y} y2={tk.y} className="grid" />
      ))}

      {/* Axes */}
      <line x1={padding.left} x2={padding.left} y1={padding.top} y2={height - padding.bottom} className="axis" />
      <line x1={padding.left} x2={width - padding.right} y1={height - padding.bottom} y2={height - padding.bottom} className="axis" />

      {/* Labels for Y ticks */}
      {ticks.map((tk, idx) => (
        <text key={idx} x={padding.left - 8} y={tk.y + 4} fontSize="10" fill="#64748b" textAnchor="end">
          {Math.round(tk.v * 10) / 10}
        </text>
      ))}

      {/* Line path */}
      <path d={path} className="line" style={{ stroke: color }} />

      {/* Dots */}
      {data.map((d, i) => (
        <circle key={i} cx={scaleX(i)} cy={scaleY(d.y)} r="3.2" className="dot" style={{ fill: color }} />
      ))}
    </svg>
  );
}