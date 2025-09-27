import React, { useMemo } from "react";
import CircularGauge from "./charts/CircularGauge";

/**
 * EmotionalStatusCard
 * - Computes a simple emotional well-being score from severity series:
 *   lower average severity => higher score.
 * props:
 *  - series: Array<{ date: string, avgSeverity: number }>
 *  - trendTags: Record<string, "mejorando"|"empeorando"|"estable">
 */
export default function EmotionalStatusCard({ series = [], trendTags = {} }) {
  // Map severity 1..5 to score (5 worst -> 0, 1 best -> 100)
  const latest = series.length ? series[series.length - 1].avgSeverity : 3;
  const score = useMemo(() => (1 - ((latest - 1) / 4)) * 100, [latest]);

  const worsening = Object.entries(trendTags).filter(([, v]) => v === "empeorando").map(([k]) => k);
  const improving = Object.entries(trendTags).filter(([, v]) => v === "mejorando").map(([k]) => k);

  return (
    <div className="section-card" style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 16 }}>
      <div style={{ display: "grid", placeItems: "center" }}>
        <CircularGauge value={score} label="Bienestar" />
      </div>
      <div>
        <div className="heading">Estado emocional estimado</div>
        <div className="subtle mt-1" style={{ fontSize: 14 }}>
          Basado en la severidad promedio de síntomas reportados.
        </div>

        <div className="mt-3" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {improving.length > 0 && (
            <span className="chip" title="Síntomas que van mejorando">
              👍 Mejorando: {improving.join(", ")}
            </span>
          )}
          {worsening.length > 0 && (
            <span className="chip" title="Síntomas que van empeorando" style={{ background: "#fee2e2", borderColor: "#fecaca" }}>
              ⚠️ Empeorando: {worsening.join(", ")}
            </span>
          )}
          {improving.length === 0 && worsening.length === 0 && <span className="chip">Estable</span>}
        </div>

        {series.length > 1 && (
          <div className="subtle mt-3" style={{ fontSize: 12 }}>
            Última actualización: {new Date(series[series.length - 1].date).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}