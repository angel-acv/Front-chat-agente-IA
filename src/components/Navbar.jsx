import React from "react";
import { Link, useLocation } from "react-router-dom";
import { getUserInfo, logout } from "../services/api";

export default function Navbar() {
  const loc = useLocation();
  const user = getUserInfo() || {};
  const role = user.role || "";

  const links = [
    { to: "/chat", label: "Chat" },
    { to: "/chat/conversational", label: "Conversacional" },
    { to: "/history", label: "Historial" },
    // Dashboard solo psicólogo o admin
    ...(role === "psychologist" || role === "admin" ? [{ to: "/dashboard", label: "Ingesta/Léxico" }] : []),
    ...(role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
    { to: "/status", label: "Estado" }
  ];

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  return (
    <div className="navbar">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="brand-cube" />
          <div className="heading">Camila AI </div>
        </div>
        <div className="nav-links">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} className={["nav-link", loc.pathname === to ? "active" : ""].join(" ")}>
              {label}
            </Link>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {user?.username ? (
            <>
              <span className="subtle">Hola, <strong>{user.username}</strong> ({role || "user"})</span>
              <button className="btn-ghost" onClick={handleLogout}>Salir</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Ingresar</Link>
              <Link to="/register" className="btn-primary">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}