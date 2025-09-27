import React, { useState } from "react";
import { registerUser } from "../../services/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser({ username, email, password });
      window.location.href = "/chat";
    } catch (e) {
      alert(e.message || "Error registrando");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card" style={{ maxWidth: 420, margin: "24px auto" }}>
      <div className="heading">Registrarse</div>
      <form className="mt-3" onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input className="input" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="input" placeholder="Email (opcional)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Creando..." : "Crear cuenta"}</button>
      </form>
    </div>
  );
}