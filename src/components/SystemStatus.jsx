import React, { useEffect, useState } from "react";
import { getSystemStatus } from "../services/api";

export default function SystemStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const s = await getSystemStatus();
      setStatus(s);
    } catch (e) {
      alert(e.message || "Error leyendo estado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="section-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
        <div className="heading">Estado del sistema</div>
        <div className="subtle text-xs">{loading ? "Cargando..." : ""}</div>
      </div>
      {!status ? (
        <div className="subtle mt-2">Sin datos</div>
      ) : (
        <div className="mt-3" style={{ display: "grid", gap: 12 }}>
          <div className="subtle" style={{ fontSize: 14 }}>
            Detector inteligente: <span style={{ color: "#0f172a" }}>{status.intelligent_detector}</span>
          </div>
          <div>
            <div className="font-semibold mb-1">Capacidades</div>
            <ul className="list-disc list-inside" style={{ display: "grid", gap: 6, fontSize: 14 }}>
              {(status.analysis_capabilities || []).map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}