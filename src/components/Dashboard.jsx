import React, { useEffect, useMemo, useState } from "react";
import DocumentUpload from "./DocumentUpload";
import LexiconManager from "./LexiconManager";
import SimpleLineChart from "./charts/SimpleLineChart";
import SimpleBarChart from "./charts/SimpleBarChart";
import EmotionalStatusCard from "./EmotionalStatusCard";
import { getSymptomTrends } from "../services/api";

/**
 * Dashboard with graphs and emotional states
 * - Trends line chart (average severity over time)
 * - Recommendations effectiveness bar chart
 * - Emotional status gauge + tags
 * - Improvement and concerning patterns panels
 * - Existing blocks: DocumentUpload + LexiconManager
 */
export default function Dashboard() {
  const [days, setDays] = useState(30);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(false);
  const userId = "angel-acv";

  async function load() {
    setLoading(true);
    try {
      const data = await getSymptomTrends(userId, days, true);
      setTrends(data);
    } catch (e) {
      console.error(e);
      // Non-blocking UI
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [days]);

  // Build line series: average severity per date across symptoms
  const severityMap = { minimal: 1, mild: 2, moderate: 3, severe: 4, critical: 5 };
  const lineSeries = useMemo(() => {
    if (!trends || !trends.symptom_progression) return [];
    // Flatten all points: {date, severity}
    const points = [];
    Object.values(trends.symptom_progression).forEach((arr) => {
      (arr || []).forEach((p) => {
        const sevVal = typeof p.severity === "string" ? severityMap[p.severity] || 1 : Number(p.severity || 1);
        points.push({ date: p.date, sev: sevVal });
      });
    });
    // Group by date
    const byDate = {};
    points.forEach((p) => {
      const key = p.date.slice(0, 10); // YYYY-MM-DD
      (byDate[key] ||= []).push(p.sev);
    });
    // Average
    const series = Object.entries(byDate)
      .map(([date, list]) => ({ date, avgSeverity: list.reduce((a, b) => a + b, 0) / list.length }))
      .sort((a, b) => a.date.localeCompare(b.date));
    // Convert to chart data
    return series.map((p) => ({ x: p.date, y: p.avgSeverity }));
  }, [trends]);

  // Bar data for recommendations effectiveness
  const barData = useMemo(() => {
    const eff = trends?.recommendations_effectiveness || {};
    return Object.entries(eff).map(([k, v]) => ({ label: k, value: Number(v) || 0 }));
  }, [trends]);

  const trendTags = trends?.severity_trends || {};

  return (
    <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
      {/* Emotional Status */}
      <div className="col-span-2">
        <EmotionalStatusCard
          series={lineSeries.map((d) => ({ date: d.x, avgSeverity: d.y }))}
          trendTags={trendTags}
        />
      </div>

      {/* Line Chart: Average severity over time */}
      <div className="section-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="heading">Severidad promedio de síntomas</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select className="select" value={days} onChange={(e) => setDays(Number(e.target.value))}>
              <option value={7}>7 días</option>
              <option value={30}>30 días</option>
              <option value={90}>90 días</option>
            </select>
            {loading && <span className="subtle" style={{ fontSize: 12 }}>Actualizando…</span>}
          </div>
        </div>
        <div className="mt-3">
          {lineSeries.length ? (
            <SimpleLineChart data={lineSeries} yMin={1} yMax={5} yTicks={4} />
          ) : (
            <div className="subtle">Sin datos suficientes</div>
          )}
        </div>
        <div className="mt-2 subtle" style={{ fontSize: 12 }}>
          1: mínima — 5: crítica. Valores promediados por día.
        </div>
      </div>

      {/* Bar Chart: Recommendations effectiveness */}
      <div className="section-card">
        <div className="heading">Efectividad estimada de recomendaciones</div>
        <div className="mt-3">
          {barData.length ? (
            <SimpleBarChart data={barData} />
          ) : (
            <div className="subtle">Sin datos</div>
          )}
        </div>
      </div>

      {/* Patterns and indicators */}
      <div className="section-card">
        <div className="heading">Indicadores de mejora</div>
        <ul className="mt-3" style={{ display: "grid", gap: 8 }}>
          {(trends?.improvement_indicators || []).map((t, i) => (
            <li key={i} className="chip">✅ {t}</li>
          ))}
          {(!trends || !trends.improvement_indicators || trends.improvement_indicators.length === 0) && (
            <li className="subtle">Sin indicadores destacados</li>
          )}
        </ul>
      </div>

      <div className="section-card">
        <div className="heading">Patrones preocupantes</div>
        <ul className="mt-3" style={{ display: "grid", gap: 8 }}>
          {(trends?.concerning_patterns || []).map((t, i) => (
            <li key={i} className="chip" style={{ background: "#fee2e2", borderColor: "#fecaca" }}>⚠️ {t}</li>
          ))}
          {(!trends || !trends.concerning_patterns || trends.concerning_patterns.length === 0) && (
            <li className="subtle">Sin patrones preocupantes</li>
          )}
        </ul>
      </div>

      {/* Existing blocks: Document upload and lexicon management */}
      <div className="col-span-2" />
      <DocumentUpload />
      <LexiconManager />
    </div>
  );
}