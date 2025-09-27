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
import { getUserInfo } from "./services/api";

function RequireAuth({ children, roles }) {
  const u = getUserInfo() || {};
  if (!u?.username) return <Navigate to="/login" replace />;
  if (roles && roles.length > 0 && !roles.includes(u.role)) return <Navigate to="/chat" replace />;
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

          <Route path="/chat" element={<ChatInterface mode="standard" />} />
          <Route path="/chat/conversational" element={<ChatInterface mode="conversational" />} />
          <Route path="/history" element={<HistoryView />} />
          <Route path="/dashboard" element={<RequireAuth roles={["psychologist","admin"]}><Dashboard /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth roles={["admin"]}><AdminPanel /></RequireAuth>} />
          <Route path="/status" element={<SystemStatus />} />
          <Route path="*" element={<div className="section-card">404</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}