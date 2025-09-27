import React, { useEffect, useState } from "react";
import { listUsers, listRoles, createRole, assignUserRole } from "../services/api";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({ name: "", description: "" });

  async function load() {
    try {
      const [u, r] = await Promise.all([listUsers(), listRoles()]);
      setUsers(u);
      setRoles(r);
    } catch (e) {
      alert(e.message || "Error cargando admin");
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreateRole() {
    if (!newRole.name.trim()) return;
    try {
      await createRole(newRole.name.trim(), newRole.description || "");
      setNewRole({ name: "", description: "" });
      await load();
    } catch (e) {
      alert(e.message || "Error creando rol");
    }
  }

  async function handleAssign(u, roleName) {
    try {
      await assignUserRole(u.id, roleName);
      await load();
    } catch (e) {
      alert(e.message || "Error asignando rol");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <div className="section-card">
        <div className="heading">Usuarios</div>
        <div className="mt-2" style={{ maxHeight: 420, overflowY: "auto" }}>
          <table className="w-full text-sm" style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead style={{ background: "var(--primary-50)" }}>
              <tr>
                <th className="text-left px-3 py-2">ID</th>
                <th className="text-left px-3 py-2">Usuario</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">Rol</th>
                <th className="text-left px-3 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-3 py-2">{u.id}</td>
                  <td className="px-3 py-2">{u.username}</td>
                  <td className="px-3 py-2">{u.email || "—"}</td>
                  <td className="px-3 py-2">{u.role || "—"}</td>
                  <td className="px-3 py-2">
                    <select className="select" value={u.role || ""} onChange={(e) => handleAssign(u, e.target.value)}>
                      <option value="">—</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td className="px-3 py-3 subtle" colSpan={5}>Sin usuarios</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-card">
        <div className="heading">Roles</div>
        <ul className="mt-2" style={{ display: "grid", gap: 8 }}>
          {roles.map((r) => (
            <li key={r.id} className="glass" style={{ padding: "8px 10px" }}>
              <strong>{r.name}</strong>
              <div className="subtle">{r.description || "—"}</div>
            </li>
          ))}
          {roles.length === 0 && <li className="subtle">Sin roles</li>}
        </ul>
        <div className="mt-3 divider" />
        <div className="mt-3">
          <div className="heading" style={{ fontSize: 14 }}>Crear rol</div>
          <div className="mt-2" style={{ display: "grid", gap: 8 }}>
            <input className="input" placeholder="Nombre del rol" value={newRole.name} onChange={(e) => setNewRole((n) => ({ ...n, name: e.target.value }))} />
            <input className="input" placeholder="Descripción" value={newRole.description} onChange={(e) => setNewRole((n) => ({ ...n, description: e.target.value }))} />
            <button className="btn-primary" onClick={handleCreateRole}>Crear</button>
          </div>
        </div>
      </div>
    </div>
  );
}