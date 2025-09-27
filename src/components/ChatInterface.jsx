import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { sendMessage } from "../services/api";
import EmergencyContact from "./EmergencyContact";
import useConversationalChat from "../hooks/useConversationalChat";

function UrgencyPill({ level }) {
  const text = (level || "low").toUpperCase();
  const bg = {
    critical: "#b91c1c",
    high: "#dc2626",
    moderate: "#f59e0b",
    low: "#059669"
  }[level || "low"];
  return (
    <span className="badge" style={{ background: bg }}>
      Urgencia: {text}
    </span>
  );
}

export default function ChatInterface({ mode = "standard" }) {
  const [sessionId, setSessionId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [last, setLast] = useState(null);
  const userId = "angel-acv";

  const convo = useConversationalChat(userId);

  async function handleSend() {
    if (!input.trim()) return;
    setLoading(true);
    try {
      if (mode === "conversational") {
        const res = await convo.send(input.trim());
        setLast(res);
        if (!sessionId) setSessionId(res.session_id);
        setHistory((h) => [
          ...h,
          { role: "user", content: input.trim(), at: new Date().toISOString() },
          { role: "assistant", content: res.response, at: res.timestamp, meta: res }
        ]);
      } else {
        const payload = { message: input.trim(), user_id: userId, session_id: sessionId || undefined };
        const res = await sendMessage(payload);
        if (!sessionId) setSessionId(res.session_id);
        setLast(res);
        setHistory((h) => [
          ...h,
          { role: "user", content: input.trim(), at: new Date().toISOString() },
          { role: "assistant", content: res.response, at: res.timestamp, meta: res }
        ]);
      }
      setInput("");
    } catch (e) {
      alert(e.message || "Error enviando mensaje");
    } finally {
      setLoading(false);
    }
  }

  const detected = useMemo(() => last?.detected_symptoms || [], [last]);
  const recs = useMemo(() => last?.recommendations || [], [last]);
  const isCrisis = last?.urgency_level === "critical" || last?.conversation_state === "crisis";

  return (
    <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: "1fr 360px" }}>
      {/* Chat card */}
      <section className="section-card">
        <div className="flex items-center justify-between" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="brand-cube" />
            <div>
              <div className="heading">
                Chat {mode === "conversational" && <span className="subtle" style={{ fontWeight: 500 }}> (Conversacional)</span>}
              </div>
              {sessionId && <div className="subtle text-xs">Sesión: {sessionId}</div>}
            </div>
          </div>
          {last && <UrgencyPill level={last.urgency_level} />}
        </div>

        {isCrisis && (
          <div className="mt-3">
            <EmergencyContact compact />
          </div>
        )}

        <div className="mt-4 space-y-3" style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: 4 }}>
          {history.length === 0 && <div className="subtle">Escribe un mensaje para comenzar…</div>}
          {history.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div className={`${m.role === "user" ? "bubble-user" : "bubble-bot"}`} style={{ maxWidth: "80%" }}>
                <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                <div className="subtle text-xs mt-1">{dayjs(m.at).format("YYYY-MM-DD HH:mm:ss")}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 divider" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje…"
            onKeyDown={(e) => (e.key === "Enter" ? handleSend() : undefined)}
          />
          <button onClick={handleSend} disabled={loading} className="btn-primary">
            {loading ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </section>

      {/* Analysis card */}
      <aside className="section-card">
        <h3 className="heading">Análisis</h3>
        {!last ? (
          <div className="subtle mt-2">Sin datos</div>
        ) : (
          <div className="mt-2" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="grid grid-cols-2 gap-3 text-sm" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
              <div className="subtle">Tipo: <span style={{ color: "#0f172a" }}>{last.conversation_type}</span></div>
              <div className="subtle">Tono: <span style={{ color: "#0f172a" }}>{last.emotional_tone || "N/A"}</span></div>
              <div className="subtle">Confianza: <span style={{ color: "#0f172a" }}>{Math.round((last.confidence || 0) * 100)}%</span></div>
              <div className="subtle">Tiempo: <span style={{ color: "#0f172a" }}>{(last.processing_time || 0).toFixed(3)}s</span></div>
            </div>

            <div>
              <div className="font-semibold mb-1">Síntomas detectados</div>
              {detected.length === 0 && <div className="subtle">Ninguno</div>}
              <ul className="space-y-1" style={{ paddingLeft: 16 }}>
                {detected.map((s, idx) => (
                  <li key={idx} className="text-sm" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="glass" style={{ padding: "2px 8px" }}>{s.symptom_type}</span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 999,
                        color: "#fff",
                        fontSize: 12,
                        background:
                          s.severity === "critical"
                            ? "#b91c1c"
                            : s.severity === "severe"
                            ? "#dc2626"
                            : s.severity === "moderate"
                            ? "#f59e0b"
                            : "#059669"
                      }}
                    >
                      {s.severity}
                    </span>
                    {!!(s.indicators || []).length && (
                      <span className="subtle">({(s.indicators || []).join(", ")})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-semibold mb-1">Recomendaciones</div>
              {(recs || []).length === 0 && <div className="subtle">—</div>}
              <ul className="list-disc list-inside" style={{ display: "grid", gap: 6 }}>
                {(recs || []).map((r, i) => (
                  <li key={i} className="text-sm">{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}