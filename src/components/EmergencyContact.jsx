import React from "react";

export default function EmergencyContact({ compact = false }) {
  if (compact) {
    return (
      <div className="emergency-compact">
        <strong>🆘 Atención inmediata requerida</strong>
        <div className="text-xs subtle" style={{ color: "#7f1d1d" }}>
          Llama a Línea 106 (Colombia), 123 o 911 si hay peligro inminente.
        </div>
      </div>
    );
  }
  return (
    <div className="section-card" style={{ borderColor: "rgba(220,38,38,0.25)", background: "rgba(239,68,68,0.05)" }}>
      <h3 className="heading">Ayuda inmediata</h3>
      <ul className="mt-2" style={{ display: "grid", gap: 4 }}>
        <li>📞 Línea 106: Atención psicosocial 24/7 (Colombia)</li>
        <li>🚓 Línea 123: Emergencias</li>
        <li>🏥 Urgencias más cercanas</li>
      </ul>
      <div className="subtle mt-2">Permanece acompañado. Tu seguridad es lo más importante.</div>
    </div>
  );
}