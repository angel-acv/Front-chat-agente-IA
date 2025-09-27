import React from "react";

/**
 * CircularGauge
 * props:
 *  - value: 0..100
 *  - size?: number
 *  - stroke?: number
 *  - label?: string
 *  - color?: string
 */
export default function CircularGauge({ value = 50, size = 140, stroke = 12, label = "Estado emocional", color = "#2563eb" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * c;

  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e2e8f0" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{Math.round(value)}%</div>
          <div className="subtle" style={{ fontSize: 12 }}>{label}</div>
        </div>
      </div>
    </div>
  );
}