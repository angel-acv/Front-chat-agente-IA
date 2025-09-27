import React, { useEffect, useState } from "react";
import { listSymptomKeywords, deleteSymptomKeyword, upsertSymptomKeywords } from "../services/api";

export default function LexiconManager() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ symptom_type: "depression", keyword: "", weight: 1, source: "user", active: true });

  async function refresh() {
    setLoading(true);
    try {
      const res = await listSymptomKeywords(filter || undefined);
      setItems(res.items || []);
    } catch (e) {
      alert(e.message || "Error listando keywords");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [filter]);

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta palabra clave?")) return;
    try {
      await deleteSymptomKeyword(id);
      await refresh();
    } catch (e) {
      alert(e.message || "Error eliminando");
    }
  }

  async function handleAdd() {
    if (!newItem.keyword.trim()) return;
    try {
      await upsertSymptomKeywords([{ ...newItem, keyword: newItem.keyword.toLowerCase().trim() }]);
      setNewItem({ ...newItem, keyword: "" });
      await refresh();
    } catch (e) {
      alert(e.message || "Error agregando");
    }
  }

  return (
    <div className="section-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 className="heading">Léxico de síntomas</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="select">
            <option value="">Todos</option>
            <option value="depression">depression</option>
            <option value="anxiety">anxiety</option>
            <option value="stress">stress</option>
            <option value="insomnia">insomnia</option>
            <option value="irritability">irritability</option>
          </select>
          <button className="btn-ghost" onClick={refresh} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-2xl" style={{ overflow: "hidden", border: "1px solid var(--border)" }}>
        <table className="w-full text-sm" style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead style={{ background: "var(--primary-50)" }}>
            <tr>
              <th className="text-left px-3 py-2">Síntoma</th>
              <th className="text-left px-3 py-2">Keyword</th>
              <th className="text-left px-3 py-2">Peso</th>
              <th className="text-left px-3 py-2">Fuente</th>
              <th className="text-left px-3 py-2">Activo</th>
              <th className="text-left px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(items || []).map((it) => (
              <tr key={it.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td className="px-3 py-2">{it.symptom_type}</td>
                <td className="px-3 py-2">{it.keyword}</td>
                <td className="px-3 py-2">{it.weight}</td>
                <td className="px-3 py-2">{it.source}</td>
                <td className="px-3 py-2">{it.active ? "✅" : "❌"}</td>
                <td className="px-3 py-2">
                  <button className="btn-danger" onClick={() => handleDelete(it.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {(!items || items.length === 0) && (
              <tr>
                <td colSpan={6} className="px-3 py-4 subtle">Sin palabras clave</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold">Agregar palabra clave</h4>
        <div className="mt-2" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <select value={newItem.symptom_type} onChange={(e) => setNewItem((n) => ({ ...n, symptom_type: e.target.value }))} className="select">
            <option value="depression">depression</option>
            <option value="anxiety">anxiety</option>
            <option value="stress">stress</option>
            <option value="insomnia">insomnia</option>
            <option value="irritability">irritability</option>
          </select>
          <input
            placeholder="keyword"
            value={newItem.keyword}
            onChange={(e) => setNewItem((n) => ({ ...n, keyword: e.target.value }))}
            className="input"
          />
          <input
            type="number"
            step="0.1"
            min={0.1}
            max={5}
            value={newItem.weight || 1}
            onChange={(e) => setNewItem((n) => ({ ...n, weight: Number(e.target.value) }))}
            className="input"
            style={{ width: 110 }}
          />
          <select value={newItem.source} onChange={(e) => setNewItem((n) => ({ ...n, source: e.target.value }))} className="select">
            <option value="user">user</option>
            <option value="doc">doc</option>
            <option value="system">system</option>
          </select>
          <label className="text-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={!!newItem.active} onChange={(e) => setNewItem((n) => ({ ...n, active: e.target.checked }))} />
            Activo
          </label>
          <button className="btn-primary" onClick={handleAdd}>Agregar</button>
        </div>
      </div>
    </div>
  );
}