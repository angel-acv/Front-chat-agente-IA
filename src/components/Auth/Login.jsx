import React, { useState } from "react";
import { loginUser, loginPsychologist, loginAdmin, setUserInfo, getUserInfo } from "../../services/api";

export default function Login() {
  const [mode, setMode] = useState("user"); // user | psychologist | admin
  const [username_or_email, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "user") await loginUser({ username_or_email, password });
      if (mode === "psychologist") await loginPsychologist({ username_or_email, password });
      if (mode === "admin") await loginAdmin({ username_or_email, password });
      window.location.href = "/chat";
    } catch (e) {
      alert(e.message || "Error de login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card" style={{ maxWidth: 420, margin: "24px auto" }}>
      <div className="heading">Iniciar sesión</div>
      <div className="subtle mt-1">Selecciona tu tipo de acceso</div>
      <div className="mt-3" style={{ display: "flex", gap: 8 }}>
        <button className={["btn-ghost", mode === "user" ? "active" : ""].join(" ")} onClick={() => setMode("user")}>Usuario</button>
        <button className={["btn-ghost", mode === "psychologist" ? "active" : ""].join(" ")} onClick={() => setMode("psychologist")}>Psicólogo</button>
        <button className={["btn-ghost", mode === "admin" ? "active" : ""].join(" ")} onClick={() => setMode("admin")}>Administrador</button>
      </div>

      <form className="mt-3" onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input className="input" placeholder="Usuario o email" value={username_or_email} onChange={(e) => setUsername(e.target.value)} />
        <input className="input" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Ingresando..." : "Ingresar"}</button>
      </form>
    </div>
  );
}