import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL,
  timeout: 20000
});

// Auth token handling
let accessToken = localStorage.getItem("access_token") || "";
let refreshToken = localStorage.getItem("refresh_token") || "";

export function setAuth(tokens) {
  accessToken = tokens?.access_token || "";
  refreshToken = tokens?.refresh_token || "";
  if (accessToken) localStorage.setItem("access_token", accessToken);
  if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
}
export function clearAuth() {
  accessToken = "";
  refreshToken = "";
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_info");
}
export function setUserInfo(info) {
  localStorage.setItem("user_info", JSON.stringify(info || {}));
}
export function getUserInfo() {
  try { return JSON.parse(localStorage.getItem("user_info") || "{}"); } catch { return {}; }
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err?.response?.status;
    if (status === 401 && refreshToken && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refresh_token: refreshToken });
        setAuth(data);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        clearAuth();
      }
    }
    const msg = err?.response?.data?.detail || err?.response?.data?.error || err.message || "Network error";
    return Promise.reject(new Error(msg));
  }
);

// Auth endpoints
export async function registerUser({ username, email, password }) {
  const { data } = await api.post("/auth/register", { username, email, password });
  setAuth(data);
  setUserInfo({ user_id: data.user_id, username: data.username, role: data.role });
  return data;
}
export async function loginUser({ username_or_email, password }) {
  const { data } = await api.post("/auth/login/user", { username_or_email, password });
  setAuth(data);
  setUserInfo({ user_id: data.user_id, username: data.username, role: data.role });
  return data;
}
export async function loginPsychologist({ username_or_email, password }) {
  const { data } = await api.post("/auth/login/psychologist", { username_or_email, password });
  setAuth(data);
  setUserInfo({ user_id: data.user_id, username: data.username, role: data.role });
  return data;
}
export async function loginAdmin({ username_or_email, password }) {
  const { data } = await api.post("/auth/login/admin", { username_or_email, password });
  setAuth(data);
  setUserInfo({ user_id: data.user_id, username: data.username, role: data.role });
  return data;
}
export async function logout() {
  if (refreshToken) {
    try { await api.post("/auth/logout", { refresh_token: refreshToken }); } catch {}
  }
  clearAuth();
}

// Admin
export async function listRoles() {
  const { data } = await api.get("/admin/roles");
  return data;
}
export async function createRole(name, description) {
  const { data } = await api.post("/admin/roles", { name, description });
  return data;
}
export async function listUsers() {
  const { data } = await api.get("/admin/users");
  return data;
}
export async function assignUserRole(user_id, role_name) {
  const { data } = await api.post("/admin/users/assign-role", { user_id, role_name });
  return data;
}

// Chat
export async function sendMessage(payload) {
  const { data } = await api.post("/chat", payload);
  return data;
}
export async function sendConversational(payload) {
  const { data } = await api.post("/chat/conversational", payload);
  return data;
}
export async function getHistory(sessionId) {
  const { data } = await api.get(`/chat/history/${sessionId}`);
  return data;
}
export async function getSessions(userId) {
  const { data } = await api.get("/chat/sessions", { params: { user_id: userId } });
  return data;
}
export async function getConversationSummary(sessionId, userId) {
  const { data } = await api.get(`/chat/conversation-summary/${sessionId}`, { params: { user_id: userId } });
  return data;
}

// System status / Analytics
export async function getSystemStatus() {
  const { data } = await api.get("/symptoms/system-status");
  return data;
}
export async function getSymptomTrends(user_id, days = 30, include_recommendations_effectiveness = true) {
  const { data } = await api.get(`/symptoms/trends/${user_id}`, { params: { days, include_recommendations_effectiveness } });
  return data;
}

// Ingest (protegido psicólogo/admin)
export async function uploadDocument(file, userId = "angel-acv", title) {
  const form = new FormData();
  form.append("file", file);
  form.append("user_id", userId);
  if (title) form.append("title", title);
  const { data } = await api.post("/ingest/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}
export async function extractKeywordsFromDocument(document_id, top_k = 50, symptom_map) {
  const { data } = await api.post("/ingest/keywords/extract", { document_id, top_k, symptom_map });
  return data;
}
export async function extractKeywordsFromText(text, top_k = 50, symptom_map) {
  const { data } = await api.post("/ingest/keywords/extract", { text, top_k, symptom_map });
  return data;
}
export async function listDocuments(limit = 50, offset = 0, user_id) {
  const { data } = await api.get("/ingest/documents", { params: { limit, offset, user_id } });
  return data;
}
export async function getDocument(document_id) {
  const { data } = await api.get(`/ingest/documents/${document_id}`);
  return data;
}
export async function upsertSymptomKeywords(items) {
  const { data } = await api.post("/ingest/keywords/symptoms/upsert", { items });
  return data;
}
export async function listSymptomKeywords(symptom_type) {
  const { data } = await api.get("/ingest/keywords/symptoms", { params: { symptom_type } });
  return data;
}
export async function deleteSymptomKeyword(keyword_id) {
  const { data } = await api.delete(`/ingest/keywords/symptoms/${keyword_id}`);
  return data;
}