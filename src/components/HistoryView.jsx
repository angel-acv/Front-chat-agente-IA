import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getSessions, getHistory, getConversationSummary } from "../services/api";

export default function HistoryView() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState("");
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadSessions() {
    const res = await getSessions("angel-acv");
    setSessions(res.sessions || []);
  }

  async function openSession(sessionId) {
    setSelected(sessionId);
    setLoading(true);
    try {
      const hist = await getHistory(sessionId);
      setMessages(hist.messages || []);
      const sum = await getConversationSummary(sessionId, "angel-acv");
      setSummary(sum);
    } catch (e) {
      alert(e.message || "Error cargando sesión");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: "320px 1fr" }}>
      <div className="section-card">
        <h3 className="heading">Sesiones</h3>
        <ul className="mt-2" style={{ display: "grid", gap: 8 }}>
          {(sessions || []).map((s) => (
            <li key={s.session_id}>
              <button
                onClick={() => openSession(s.session_id)}
                className="glass"
                style={{ width: "100%", textAlign: "left", padding: "10px 12px" }}
              >
                <div className="font-semibold">{s.session_id}</div>
                <div className="subtle text-xs">
                  msgs: {s.message_count} | {s.last_updated ? dayjs(s.last_updated).format("YYYY-MM-DD HH:mm") : "—"}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="section-card" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
          <div>
            <div className="heading">Historial</div>
            {selected && <div className="subtle text-xs">Sesión: {selected}</div>}
          </div>
          <div className="subtle text-xs">{loading ? "Cargando..." : ""}</div>
        </div>

        <div className="mt-3" style={{ maxHeight: "55vh", overflowY: "auto", paddingRight: 4, display: "grid", gap: 12 }}>
          {messages.length === 0 ? (
            <div className="subtle">Selecciona una sesión</div>
          ) : (
            messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div className={`${m.role === "user" ? "bubble-user" : "bubble-bot"}`} style={{ maxWidth: "80%" }}>
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                  <div className="subtle text-xs mt-1">{dayjs(m.timestamp).format("YYYY-MM-DD HH:mm:ss")}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 divider">
          <h4 className="font-semibold">Resumen</h4>
          {!summary ? (
            <div className="subtle mt-1">—</div>
          ) : summary.status === "no_active_conversation" ? (
            <div className="subtle mt-1">No hay conversación activa</div>
          ) : (
            <div className="mt-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 14 }}>
              <div>Estado: <span style={{ color: "#0f172a" }}>{summary.conversation_state}</span></div>
              <div>Turnos: <span style={{ color: "#0f172a" }}>{summary.turn_number}</span></div>
              <div>Confianza: <span style={{ color: "#0f172a" }}>{Math.round((summary.trust_level || 0) * 100)}%</span></div>
              <div>Seguimiento: <span style={{ color: "#0f172a" }}>{summary.needs_follow_up ? "Sí" : "No"}</span></div>
              <div style={{ gridColumn: "1 / -1" }}>
                Áreas: <span style={{ color: "#0f172a" }}>{(summary.concern_areas || []).join(", ")}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}