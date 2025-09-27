import React, { useEffect, useMemo, useState } from "react";
import {
  uploadDocument,
  extractKeywordsFromDocument,
  listDocuments,
  getDocument,
  upsertSymptomKeywords
} from "../services/api";

const SYMPTOM_TYPES = ["depression", "anxiety", "stress", "insomnia", "irritability"];

export default function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docKeywords, setDocKeywords] = useState([]);
  const [mapping, setMapping] = useState({});
  const [saving, setSaving] = useState(false);

  async function refreshDocs() {
    const items = await listDocuments(50, 0, "angel-acv");
    setDocs(items || []);
  }

  useEffect(() => {
    refreshDocs();
  }, []);

  const canSave = useMemo(() => Object.keys(mapping).length > 0, [mapping]);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadDocument(file, "angel-acv", file.name);
      await refreshDocs();
      setSelectedDoc(res.document_id);
      await extractKeywordsFromDocument(res.document_id, 80);
      const full = await getDocument(res.document_id);
      setDocKeywords(full.keywords || []);
    } catch (e) {
      alert(e.message || "Error subiendo documento");
    } finally {
      setUploading(false);
    }
  }

  async function handleSelectDoc(id) {
    setSelectedDoc(id);
    const full = await getDocument(id);
    setDocKeywords(full.keywords || []);
  }

  async function handleApplyToLexicon() {
    if (!selectedDoc) return;
    setSaving(true);
    try {
      const items = Object.entries(mapping).map(([kw, st]) => ({
        keyword: kw.toLowerCase(),
        symptom_type: st,
        weight: Math.min(1.0, Math.max(0.1, (docKeywords.find((k) => k.keyword === kw)?.weight || 0.2) * 1.2)),
        source: "doc",
        active: true
      }));
      const res = await upsertSymptomKeywords(items);
      alert(`Actualizado léxico: insertados ${res.inserted}, actualizados ${res.updated}`);
      setMapping({});
    } catch (e) {
      alert(e.message || "Error aplicando al léxico");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="section-card">
      <h3 className="heading">Cargar documento (PDF, MD, TXT)</h3>
      <div className="mt-3" style={{ display: "flex", gap: 12, alignItems: "stretch", flexWrap: "wrap" }}>
        <input
          type="file"
          accept=".pdf,.md,.txt,text/markdown,text/plain,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="input"
        />
        <button className="btn-primary" disabled={!file || uploading} onClick={handleUpload}>
          {uploading ? "Subiendo..." : "Subir y extraer palabras clave"}
        </button>
      </div>

      <h4 className="font-semibold mt-5">Documentos</h4>
      <ul className="mt-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {(docs || []).map((d) => (
          <li key={d.id}>
            <button
              onClick={() => handleSelectDoc(d.id)}
              className="glass"
              style={{ width: "100%", textAlign: "left", padding: "10px 12px", transition: "background 160ms ease" }}
            >
              <div className="font-semibold">
                {d.title} <span className="subtle">({d.filename})</span>
              </div>
              <div className="subtle text-xs">{d.extracted ? "Palabras extraídas ✅" : "Pendiente ⏳"}</div>
            </button>
          </li>
        ))}
      </ul>

      {selectedDoc && (
        <>
          <h3 className="heading mt-6">Palabras clave del documento</h3>
          <div className="mt-3 rounded-2xl" style={{ overflow: "hidden", border: "1px solid var(--border)" }}>
            <table className="w-full text-sm" style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead style={{ background: "var(--primary-50)" }}>
                <tr>
                  <th className="text-left px-3 py-2">Palabra</th>
                  <th className="text-left px-3 py-2">Peso</th>
                  <th className="text-left px-3 py-2">Síntoma</th>
                </tr>
              </thead>
              <tbody>
                {docKeywords.map((k) => (
                  <tr key={k.keyword} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="px-3 py-2">{k.keyword}</td>
                    <td className="px-3 py-2">{Number(k.weight).toFixed(3)}</td>
                    <td className="px-3 py-2">
                      <select
                        value={mapping[k.keyword] || k.symptom_type || ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setMapping((m) => {
                            const next = { ...m };
                            if (!v) delete next[k.keyword];
                            else next[k.keyword] = v;
                            return next;
                          });
                        }}
                        className="select"
                      >
                        <option value="">—</option>
                        {SYMPTOM_TYPES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3">
            <button className="btn-primary" disabled={!canSave || saving} onClick={handleApplyToLexicon}>
              {saving ? "Guardando..." : "Agregar/Actualizar en léxico global"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}