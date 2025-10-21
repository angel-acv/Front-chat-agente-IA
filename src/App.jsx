import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import "./App.css";

import Navbar from "./components/Navbar";
import ChatInterface from "./components/ChatInterface";
import HistoryView from "./components/HistoryView";
import Dashboard from "./components/Dashboard";
import SystemStatus from "./components/SystemStatus";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import AdminPanel from "./components/AdminPanel";
import PsychologistReports from "./components/PsychologistReports";
import RoleManagement from "./components/RoleManagement";
import { getUserInfo } from "./services/api";
import { ROLES, hasPermission, PERMISSIONS } from "./utils/permissions";

// Componente para rutas que requieren autenticación
function RequireAuth({ children, roles, permission }) {
  const u = getUserInfo() || {};
  
  // Si no hay usuario y se requiere autenticación
  if (!u?.username && roles && roles.length > 0) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar roles si se especifican
  if (roles && roles.length > 0 && !roles.includes(u.role)) {
    return <Navigate to="/chat" replace />;
  }
  
  // Verificar permisos si se especifican
  if (permission && !hasPermission(u.role, permission)) {
    return <Navigate to="/chat" replace />;
  }
  
  return children;
}

// Componente para rutas públicas (invitados pueden acceder)
function PublicRoute({ children }) {
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <div style={{ marginTop: 16 }} />
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas públicas - Invitados pueden acceder */}
          <Route 
            path="/chat" 
            element={
              <PublicRoute>
                <ChatInterface mode="standard" />
              </PublicRoute>
            } 
          />
          <Route 
            path="/chat/conversational" 
            element={
              <PublicRoute>
                <ChatInterface mode="conversational" />
              </PublicRoute>
            } 
          />

          {/* Rutas para usuarios autenticados */}
          <Route 
            path="/history" 
            element={
              <RequireAuth roles={[ROLES.USER, ROLES.ADMIN]} permission={PERMISSIONS.VIEW_OWN_HISTORY}>
                <HistoryView />
              </RequireAuth>
            } 
          />

          {/* Rutas para psicólogos */}
          <Route 
            path="/psychologist-reports" 
            element={
              <RequireAuth roles={[ROLES.PSYCHOLOGIST, ROLES.ADMIN]} permission={PERMISSIONS.VIEW_PSYCHOLOGIST_REPORTS}>
                <PsychologistReports />
              </RequireAuth>
            } 
          />

          {/* Rutas para psicólogos y admin */}
          <Route 
            path="/dashboard" 
            element={
              <RequireAuth roles={[ROLES.PSYCHOLOGIST, ROLES.ADMIN]} permission={PERMISSIONS.VIEW_DASHBOARD}>
                <Dashboard />
              </RequireAuth>
            } 
          />

          {/* Rutas solo para administradores */}
          <Route 
            path="/admin" 
            element={
              <RequireAuth roles={[ROLES.ADMIN]} permission={PERMISSIONS.VIEW_ADMIN_PANEL}>
                <AdminPanel />
              </RequireAuth>
            } 
          />
          <Route 
            path="/admin/roles" 
            element={
              <RequireAuth roles={[ROLES.ADMIN]} permission={PERMISSIONS.MANAGE_ROLES}>
                <RoleManagement />
              </RequireAuth>
            } 
          />
          <Route 
            path="/status" 
            element={
              <RequireAuth roles={[ROLES.ADMIN]} permission={PERMISSIONS.VIEW_SYSTEM_STATUS}>
                <SystemStatus />
              </RequireAuth>
            } 
          />

          <Route path="*" element={<div className="section-card">404 - Página no encontrada</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}