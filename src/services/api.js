import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
const AUTH_BASE_URL = 'http://localhost:8000/api/auth';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTENTICACIÓN ====================

export const register = async (userData) => {
  try {
    const response = await axios.post(`${AUTH_BASE_URL}/register`, userData);
    // Guardar token y usuario
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${AUTH_BASE_URL}/login`, credentials);
    // Guardar token y usuario
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getUserInfo = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get(`${AUTH_BASE_URL}/me`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    throw error;
  }
};

export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await api.post(`${AUTH_BASE_URL}/change-password`, {
      old_password: oldPassword,
      new_password: newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    throw error;
  }
};

// ==================== CHAT ====================

export const sendMessage = async (message, mode = 'standard') => {
  try {
    const response = await api.post('/v1/chat/send', {
      message,
      mode,
    });
    return response.data;
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    throw error;
  }
};

export const sendConversational = async (message, sessionId = null) => {
  try {
    const payload = {
      message,
      mode: 'conversational'
    };
    
    if (sessionId) {
      payload.session_id = sessionId;
    }

    const response = await api.post('/v1/chat/send', payload);
    return response.data;
  } catch (error) {
    console.error('Error al enviar mensaje conversacional:', error);
    throw error;
  }
};

export const createChatSession = async () => {
  try {
    const response = await api.post('/v1/chat/session');
    return response.data;
  } catch (error) {
    console.error('Error al crear sesión:', error);
    throw error;
  }
};

export const getChatSessions = async () => {
  try {
    const response = await api.get('/v1/chat/sessions');
    return response.data;
  } catch (error) {
    console.error('Error al obtener sesiones:', error);
    throw error;
  }
};

export const getChatHistory = async (sessionId) => {
  try {
    const response = await api.get(`/v1/chat/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de chat:', error);
    throw error;
  }
};

export const deleteChatSession = async (sessionId) => {
  try {
    const response = await api.delete(`/v1/chat/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    throw error;
  }
};

// ==================== HISTORIAL ====================

export const getHistory = async () => {
  try {
    const response = await api.get('/v1/history');
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial:', error);
    throw error;
  }
};

export const getAllUsersHistory = async (params = {}) => {
  try {
    const response = await api.get('/v1/history/all', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de todos los usuarios:', error);
    throw error;
  }
};

export const getSessionHistory = async (sessionId) => {
  try {
    const response = await api.get(`/v1/history/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de sesión:', error);
    throw error;
  }
};

export const deleteSession = async (sessionId) => {
  try {
    const response = await api.delete(`/v1/history/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    throw error;
  }
};

// ==================== USUARIOS ====================

export const getAllUsers = async (skip = 0, limit = 100) => {
  try {
    const response = await api.get('/v1/users', {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const getUserStats = async () => {
  try {
    const response = await api.get('/v1/users/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    throw error;
  }
};

export const getUser = async (username) => {
  try {
    const response = await api.get(`/v1/users/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

export const updateUserRole = async (username, role) => {
  try {
    const response = await api.put(`/v1/users/${username}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    throw error;
  }
};

export const deactivateUser = async (username) => {
  try {
    const response = await api.put(`/v1/users/${username}/deactivate`);
    return response.data;
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    throw error;
  }
};

export const activateUser = async (username) => {
  try {
    const response = await api.put(`/v1/users/${username}/activate`);
    return response.data;
  } catch (error) {
    console.error('Error al activar usuario:', error);
    throw error;
  }
};

export const getUsersByRole = async (role) => {
  try {
    const response = await api.get(`/v1/users/role/${role}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    throw error;
  }
};

// ==================== DASHBOARD Y ANALYTICS ====================

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/v1/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    throw error;
  }
};

export const getAnalytics = async (params = {}) => {
  try {
    const response = await api.get('/v1/analytics', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener analytics:', error);
    throw error;
  }
};

// ==================== ADMIN ====================

export const getSystemStatus = async () => {
  try {
    const response = await api.get('/v1/admin/status');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estado del sistema:', error);
    throw error;
  }
};

export const getSystemMetrics = async () => {
  try {
    const response = await api.get('/metrics');
    return response.data;
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    throw error;
  }
};

// ==================== SÍNTOMAS ====================

export const analyzeSymptoms = async (text) => {
  try {
    const response = await api.post('/v1/symptoms/analyze', { text });
    return response.data;
  } catch (error) {
    console.error('Error al analizar síntomas:', error);
    throw error;
  }
};

export const getSymptomHistory = async () => {
  try {
    const response = await api.get('/v1/symptoms/history');
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de síntomas:', error);
    throw error;
  }
};

// ==================== LÉXICO ====================

export const getLexicon = async () => {
  try {
    const response = await api.get('/v1/lexicon');
    return response.data;
  } catch (error) {
    console.error('Error al obtener léxico:', error);
    throw error;
  }
};

export const addLexiconKeyword = async (keyword) => {
  try {
    const response = await api.post('/v1/lexicon/keyword', keyword);
    return response.data;
  } catch (error) {
    console.error('Error al agregar palabra clave:', error);
    throw error;
  }
};

export const updateLexiconKeyword = async (keywordId, data) => {
  try {
    const response = await api.put(`/v1/lexicon/keyword/${keywordId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar palabra clave:', error);
    throw error;
  }
};

export const deleteLexiconKeyword = async (keywordId) => {
  try {
    const response = await api.delete(`/v1/lexicon/keyword/${keywordId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar palabra clave:', error);
    throw error;
  }
};

// ==================== DOCUMENTOS ====================

export const uploadDocument = async (file, metadata = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const response = await api.post('/v1/ingest/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al subir documento:', error);
    throw error;
  }
};

export const getDocuments = async () => {
  try {
    const response = await api.get('/v1/ingest/documents');
    return response.data;
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    throw error;
  }
};

export const getDocument = async (documentId) => {
  try {
    const response = await api.get(`/v1/ingest/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener documento:', error);
    throw error;
  }
};

export const deleteDocument = async (documentId) => {
  try {
    const response = await api.delete(`/v1/ingest/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    throw error;
  }
};

// ==================== HEALTH CHECK ====================

export const healthCheck = async () => {
  try {
    const response = await axios.get('http://localhost:8000/health');
    return response.data;
  } catch (error) {
    console.error('Error en health check:', error);
    throw error;
  }
};

// ==================== CONVERSACIONES Y RESÚMENES ====================

export const getConversationSummary = async (sessionId) => {
  try {
    const response = await api.get(`/v1/chat/session/${sessionId}/summary`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener resumen de conversación:', error);
    // Si no existe el endpoint, devolver null
    return null;
  }
};

export const generateConversationSummary = async (sessionId) => {
  try {
    const response = await api.post(`/v1/chat/session/${sessionId}/summary`);
    return response.data;
  } catch (error) {
    console.error('Error al generar resumen:', error);
    throw error;
  }
};

export const getConversationInsights = async (sessionId) => {
  try {
    const response = await api.get(`/v1/chat/session/${sessionId}/insights`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener insights:', error);
    return null;
  }
};

export const searchHistory = async (query, filters = {}) => {
  try {
    const response = await api.get('/v1/history/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  } catch (error) {
    console.error('Error al buscar en historial:', error);
    throw error;
  }
};

export const exportHistory = async (format = 'json', filters = {}) => {
  try {
    const response = await api.get('/v1/history/export', {
      params: { format, ...filters },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar historial:', error);
    throw error;
  }
};

// ==================== ESTADÍSTICAS DE CONVERSACIONES ====================

export const getConversationStats = async (sessionId) => {
  try {
    const response = await api.get(`/v1/chat/session/${sessionId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return {
      total_messages: 0,
      user_messages: 0,
      assistant_messages: 0,
      average_response_time: 0,
      sentiment: null
    };
  }
};

export const getUserConversationStats = async () => {
  try {
    const response = await api.get('/v1/history/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de usuario:', error);
    return {
      total_conversations: 0,
      total_messages: 0,
      last_conversation_date: null
    };
  }
};

// ==================== FAVORITOS Y ETIQUETAS ====================

export const markAsFavorite = async (sessionId) => {
  try {
    const response = await api.post(`/v1/history/session/${sessionId}/favorite`);
    return response.data;
  } catch (error) {
    console.error('Error al marcar como favorito:', error);
    throw error;
  }
};

export const removeFavorite = async (sessionId) => {
  try {
    const response = await api.delete(`/v1/history/session/${sessionId}/favorite`);
    return response.data;
  } catch (error) {
    console.error('Error al quitar favorito:', error);
    throw error;
  }
};

export const addTag = async (sessionId, tag) => {
  try {
    const response = await api.post(`/v1/history/session/${sessionId}/tags`, { tag });
    return response.data;
  } catch (error) {
    console.error('Error al agregar etiqueta:', error);
    throw error;
  }
};

export const removeTag = async (sessionId, tag) => {
  try {
    const response = await api.delete(`/v1/history/session/${sessionId}/tags/${tag}`);
    return response.data;
  } catch (error) {
    console.error('Error al quitar etiqueta:', error);
    throw error;
  }
};

// ==================== NOTAS Y COMENTARIOS ====================

export const addNote = async (sessionId, note) => {
  try {
    const response = await api.post(`/v1/history/session/${sessionId}/notes`, { note });
    return response.data;
  } catch (error) {
    console.error('Error al agregar nota:', error);
    throw error;
  }
};

export const updateNote = async (sessionId, noteId, note) => {
  try {
    const response = await api.put(`/v1/history/session/${sessionId}/notes/${noteId}`, { note });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar nota:', error);
    throw error;
  }
};

export const deleteNote = async (sessionId, noteId) => {
  try {
    const response = await api.delete(`/v1/history/session/${sessionId}/notes/${noteId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar nota:', error);
    throw error;
  }
};
// ==================== PROCESAMIENTO DE DOCUMENTOS ====================

export const extractKeywordsFromDocument = async (documentId) => {
  try {
    const response = await api.post(`/v1/ingest/documents/${documentId}/extract-keywords`);
    return response.data;
  } catch (error) {
    console.error('Error al extraer palabras clave:', error);
    throw error;
  }
};

export const processDocument = async (documentId) => {
  try {
    const response = await api.post(`/v1/ingest/documents/${documentId}/process`);
    return response.data;
  } catch (error) {
    console.error('Error al procesar documento:', error);
    throw error;
  }
};

export const getDocumentKeywords = async (documentId) => {
  try {
    const response = await api.get(`/v1/ingest/documents/${documentId}/keywords`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener palabras clave del documento:', error);
    throw error;
  }
};

export const updateDocumentKeyword = async (documentId, keywordId, data) => {
  try {
    const response = await api.put(`/v1/ingest/documents/${documentId}/keywords/${keywordId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar palabra clave:', error);
    throw error;
  }
};

export const deleteDocumentKeyword = async (documentId, keywordId) => {
  try {
    const response = await api.delete(`/v1/ingest/documents/${documentId}/keywords/${keywordId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar palabra clave:', error);
    throw error;
  }
};

export const getDocumentContent = async (documentId) => {
  try {
    const response = await api.get(`/v1/ingest/documents/${documentId}/content`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener contenido del documento:', error);
    throw error;
  }
};

export const searchDocuments = async (query, filters = {}) => {
  try {
    const response = await api.get('/v1/ingest/documents/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  } catch (error) {
    console.error('Error al buscar documentos:', error);
    throw error;
  }
};

export const updateDocument = async (documentId, data) => {
  try {
    const response = await api.put(`/v1/ingest/documents/${documentId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar documento:', error);
    throw error;
  }
};

export const downloadDocument = async (documentId) => {
  try {
    const response = await api.get(`/v1/ingest/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al descargar documento:', error);
    throw error;
  }
};

export const getDocumentStats = async () => {
  try {
    const response = await api.get('/v1/ingest/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de documentos:', error);
    return {
      total_documents: 0,
      total_size: 0,
      by_type: {}
    };
  }
};

// ==================== OCR Y EXTRACCIÓN DE TEXTO ====================

export const extractTextFromImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/v1/ingest/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al extraer texto de imagen:', error);
    throw error;
  }
};

export const extractTextFromPDF = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/v1/ingest/pdf-extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al extraer texto de PDF:', error);
    throw error;
  }
};

// ==================== ANÁLISIS DE DOCUMENTOS ====================

export const analyzeDocument = async (documentId) => {
  try {
    const response = await api.post(`/v1/ingest/documents/${documentId}/analyze`);
    return response.data;
  } catch (error) {
    console.error('Error al analizar documento:', error);
    throw error;
  }
};

export const getDocumentSummary = async (documentId) => {
  try {
    const response = await api.get(`/v1/ingest/documents/${documentId}/summary`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener resumen del documento:', error);
    return null;
  }
};

export const categorizeDocument = async (documentId) => {
  try {
    const response = await api.post(`/v1/ingest/documents/${documentId}/categorize`);
    return response.data;
  } catch (error) {
    console.error('Error al categorizar documento:', error);
    throw error;
  }
};

// ==================== COMPARTIR Y PERMISOS ====================

export const shareDocument = async (documentId, username) => {
  try {
    const response = await api.post(`/v1/ingest/documents/${documentId}/share`, { username });
    return response.data;
  } catch (error) {
    console.error('Error al compartir documento:', error);
    throw error;
  }
};

export const unshareDocument = async (documentId, username) => {
  try {
    const response = await api.delete(`/v1/ingest/documents/${documentId}/share/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error al dejar de compartir documento:', error);
    throw error;
  }
};

export const getSharedDocuments = async () => {
  try {
    const response = await api.get('/v1/ingest/documents/shared');
    return response.data;
  } catch (error) {
    console.error('Error al obtener documentos compartidos:', error);
    throw error;
  }
};

// ==================== VERSIONES Y HISTORIAL DE DOCUMENTOS ====================

export const getDocumentVersions = async (documentId) => {
  try {
    const response = await api.get(`/v1/ingest/documents/${documentId}/versions`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener versiones del documento:', error);
    throw error;
  }
};

export const restoreDocumentVersion = async (documentId, versionId) => {
  try {
    const response = await api.post(`/v1/ingest/documents/${documentId}/versions/${versionId}/restore`);
    return response.data;
  } catch (error) {
    console.error('Error al restaurar versión del documento:', error);
    throw error;
  }
};

// ==================== PLANTILLAS DE DOCUMENTOS ====================

export const getDocumentTemplates = async () => {
  try {
    const response = await api.get('/v1/ingest/templates');
    return response.data;
  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    throw error;
  }
};

export const createDocumentFromTemplate = async (templateId, data) => {
  try {
    const response = await api.post(`/v1/ingest/templates/${templateId}/create`, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear documento desde plantilla:', error);
    throw error;
  }
};

// ==================== VALIDACIÓN Y VERIFICACIÓN ====================

export const validateDocument = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/v1/ingest/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al validar documento:', error);
    throw error;
  }
};

export const checkDocumentStatus = async (documentId) => {
  try {
    const response = await api.get(`/v1/ingest/documents/${documentId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error al verificar estado del documento:', error);
    throw error;
  }
};

// ==================== EXPORTACIÓN E IMPORTACIÓN ====================

export const exportDocuments = async (documentIds, format = 'zip') => {
  try {
    const response = await api.post('/v1/ingest/export', {
      document_ids: documentIds,
      format
    }, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar documentos:', error);
    throw error;
  }
};

export const importDocuments = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/v1/ingest/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al importar documentos:', error);
    throw error;
  }
};


// ... código existente ...

// ==================== GESTIÓN DE LÉXICO DE SÍNTOMAS ====================

export const getSymptomKeywords = async () => {
  try {
    const response = await api.get('/v1/symptoms/keywords');
    return response.data;
  } catch (error) {
    console.error('Error al obtener palabras clave de síntomas:', error);
    throw error;
  }
};

export const addSymptomKeyword = async (keywordData) => {
  try {
    const response = await api.post('/v1/symptoms/keywords', keywordData);
    return response.data;
  } catch (error) {
    console.error('Error al agregar palabra clave:', error);
    throw error;
  }
};

export const updateSymptomKeyword = async (keywordId, data) => {
  try {
    const response = await api.put(`/v1/symptoms/keywords/${keywordId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar palabra clave:', error);
    throw error;
  }
};

export const deleteSymptomKeyword = async (keywordId) => {
  try {
    const response = await api.delete(`/v1/symptoms/keywords/${keywordId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar palabra clave:', error);
    throw error;
  }
};

export const toggleSymptomKeyword = async (keywordId, active) => {
  try {
    const response = await api.patch(`/v1/symptoms/keywords/${keywordId}/toggle`, { active });
    return response.data;
  } catch (error) {
    console.error('Error al cambiar estado de palabra clave:', error);
    throw error;
  }
};

export const getSymptomTypes = async () => {
  try {
    const response = await api.get('/v1/symptoms/types');
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de síntomas:', error);
    return ['ansiedad', 'depresion', 'estres', 'panico', 'fobia', 'obsesivo_compulsivo'];
  }
};

export const getKeywordsBySymptomType = async (symptomType) => {
  try {
    const response = await api.get(`/v1/symptoms/keywords/type/${symptomType}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener palabras clave por tipo:', error);
    throw error;
  }
};

export const bulkAddKeywords = async (keywords) => {
  try {
    const response = await api.post('/v1/symptoms/keywords/bulk', { keywords });
    return response.data;
  } catch (error) {
    console.error('Error al agregar palabras clave en lote:', error);
    throw error;
  }
};

export const bulkDeleteKeywords = async (keywordIds) => {
  try {
    const response = await api.post('/v1/symptoms/keywords/bulk-delete', { keyword_ids: keywordIds });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar palabras clave en lote:', error);
    throw error;
  }
};

export const importKeywordsFromFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/v1/symptoms/keywords/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al importar palabras clave:', error);
    throw error;
  }
};

export const exportKeywordsToFile = async (format = 'json') => {
  try {
    const response = await api.get('/v1/symptoms/keywords/export', {
      params: { format },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar palabras clave:', error);
    throw error;
  }
};

export const searchKeywords = async (query) => {
  try {
    const response = await api.get('/v1/symptoms/keywords/search', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error al buscar palabras clave:', error);
    throw error;
  }
};

export const getKeywordStats = async () => {
  try {
    const response = await api.get('/v1/symptoms/keywords/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de palabras clave:', error);
    return {
      total: 0,
      by_type: {},
      by_source: {},
      active: 0,
      inactive: 0
    };
  }
};

export const duplicateKeyword = async (keywordId) => {
  try {
    const response = await api.post(`/v1/symptoms/keywords/${keywordId}/duplicate`);
    return response.data;
  } catch (error) {
    console.error('Error al duplicar palabra clave:', error);
    throw error;
  }
};

export const mergeKeywords = async (sourceId, targetId) => {
  try {
    const response = await api.post('/v1/symptoms/keywords/merge', {
      source_id: sourceId,
      target_id: targetId
    });
    return response.data;
  } catch (error) {
    console.error('Error al combinar palabras clave:', error);
    throw error;
  }
};

// ==================== ANÁLISIS DE SÍNTOMAS ADICIONAL ====================

export const detectSymptoms = async (text) => {
  try {
    const response = await api.post('/v1/symptoms/detect', { text });
    return response.data;
  } catch (error) {
    console.error('Error al detectar síntomas:', error);
    throw error;
  }
};

export const getSymptomRecommendations = async (symptomType) => {
  try {
    const response = await api.get(`/v1/symptoms/${symptomType}/recommendations`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    throw error;
  }
};

export const getSymptomSeverityLevels = async () => {
  try {
    const response = await api.get('/v1/symptoms/severity-levels');
    return response.data;
  } catch (error) {
    console.error('Error al obtener niveles de severidad:', error);
    return ['leve', 'moderado', 'severo', 'critico'];
  }
};

export const analyzeSymptomTrends = async (userId, dateFrom, dateTo) => {
  try {
    const response = await api.get('/v1/symptoms/trends', {
      params: { user_id: userId, date_from: dateFrom, date_to: dateTo }
    });
    return response.data;
  } catch (error) {
    console.error('Error al analizar tendencias de síntomas:', error);
    throw error;
  }
};

export const compareSymptoms = async (sessionId1, sessionId2) => {
  try {
    const response = await api.get('/v1/symptoms/compare', {
      params: { session1: sessionId1, session2: sessionId2 }
    });
    return response.data;
  } catch (error) {
    console.error('Error al comparar síntomas:', error);
    throw error;
  }
};

// ==================== VALIDACIÓN DE LÉXICO ====================

export const validateKeyword = async (keyword, symptomType) => {
  try {
    const response = await api.post('/v1/symptoms/keywords/validate', {
      keyword,
      symptom_type: symptomType
    });
    return response.data;
  } catch (error) {
    console.error('Error al validar palabra clave:', error);
    throw error;
  }
};

export const suggestKeywords = async (symptomType) => {
  try {
    const response = await api.get(`/v1/symptoms/keywords/suggestions/${symptomType}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener sugerencias:', error);
    return [];
  }
};

export const checkDuplicateKeywords = async () => {
  try {
    const response = await api.get('/v1/symptoms/keywords/duplicates');
    return response.data;
  } catch (error) {
    console.error('Error al verificar duplicados:', error);
    throw error;
  }
};

// ... código existente ...

// ==================== DASHBOARD Y MÉTRICAS ====================

export const getDashboardData = async () => {
  try {
    const response = await api.get('/v1/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    return {
      total_users: 0,
      total_sessions: 0,
      total_messages: 0,
      active_users_today: 0
    };
  }
};

export const getSymptomTrends = async (dateFrom = null, dateTo = null) => {
  try {
    const params = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    
    const response = await api.get('/v1/dashboard/symptom-trends', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener tendencias de síntomas:', error);
    return [];
  }
};

export const getUserActivityStats = async (period = '7d') => {
  try {
    const response = await api.get('/v1/dashboard/user-activity', {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener actividad de usuarios:', error);
    return {
      daily: [],
      weekly: [],
      monthly: []
    };
  }
};

export const getConversationMetrics = async () => {
  try {
    const response = await api.get('/v1/dashboard/conversation-metrics');
    return response.data;
  } catch (error) {
    console.error('Error al obtener métricas de conversaciones:', error);
    return {
      total_conversations: 0,
      average_length: 0,
      average_duration: 0,
      most_active_hours: []
    };
  }
};

export const getSentimentAnalysis = async (period = '30d') => {
  try {
    const response = await api.get('/v1/dashboard/sentiment-analysis', {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener análisis de sentimientos:', error);
    return {
      positive: 0,
      neutral: 0,
      negative: 0,
      timeline: []
    };
  }
};

export const getResponseTimeStats = async () => {
  try {
    const response = await api.get('/v1/dashboard/response-time');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de tiempo de respuesta:', error);
    return {
      average: 0,
      median: 0,
      min: 0,
      max: 0
    };
  }
};

export const getTopSymptoms = async (limit = 10) => {
  try {
    const response = await api.get('/v1/dashboard/top-symptoms', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener síntomas principales:', error);
    return [];
  }
};

export const getCrisisDetections = async (dateFrom = null, dateTo = null) => {
  try {
    const params = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    
    const response = await api.get('/v1/dashboard/crisis-detections', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener detecciones de crisis:', error);
    return [];
  }
};

export const getUserGrowthStats = async () => {
  try {
    const response = await api.get('/v1/dashboard/user-growth');
    return response.data;
  } catch (error) {
    console.error('Error al obtener crecimiento de usuarios:', error);
    return {
      daily: [],
      weekly: [],
      monthly: [],
      total: 0
    };
  }
};

export const getEngagementMetrics = async () => {
  try {
    const response = await api.get('/v1/dashboard/engagement');
    return response.data;
  } catch (error) {
    console.error('Error al obtener métricas de engagement:', error);
    return {
      daily_active_users: 0,
      weekly_active_users: 0,
      monthly_active_users: 0,
      retention_rate: 0
    };
  }
};

export const getSystemHealth = async () => {
  try {
    const response = await api.get('/v1/dashboard/system-health');
    return response.data;
  } catch (error) {
    console.error('Error al obtener salud del sistema:', error);
    return {
      status: 'unknown',
      uptime: 0,
      cpu_usage: 0,
      memory_usage: 0,
      disk_usage: 0
    };
  }
};

export const getPopularKeywords = async (limit = 20) => {
  try {
    const response = await api.get('/v1/dashboard/popular-keywords', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener palabras clave populares:', error);
    return [];
  }
};

export const getAverageSessionDuration = async () => {
  try {
    const response = await api.get('/v1/dashboard/average-session-duration');
    return response.data;
  } catch (error) {
    console.error('Error al obtener duración promedio de sesión:', error);
    return {
      average_minutes: 0,
      by_hour: []
    };
  }
};

export const getUserDemographics = async () => {
  try {
    const response = await api.get('/v1/dashboard/demographics');
    return response.data;
  } catch (error) {
    console.error('Error al obtener demografía de usuarios:', error);
    return {
      by_role: {},
      by_status: {},
      new_users_this_week: 0,
      new_users_this_month: 0
    };
  }
};

export const getConversationTopics = async (limit = 10) => {
  try {
    const response = await api.get('/v1/dashboard/conversation-topics', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener temas de conversación:', error);
    return [];
  }
};

export const getPeakUsageHours = async () => {
  try {
    const response = await api.get('/v1/dashboard/peak-hours');
    return response.data;
  } catch (error) {
    console.error('Error al obtener horas pico:', error);
    return [];
  }
};

export const getRetentionRate = async (period = '30d') => {
  try {
    const response = await api.get('/v1/dashboard/retention', {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener tasa de retención:', error);
    return {
      rate: 0,
      cohorts: []
    };
  }
};

export const getErrorRates = async () => {
  try {
    const response = await api.get('/v1/dashboard/error-rates');
    return response.data;
  } catch (error) {
    console.error('Error al obtener tasas de error:', error);
    return {
      total_errors: 0,
      error_rate: 0,
      by_type: {}
    };
  }
};

export const getRecentAlerts = async (limit = 5) => {
  try {
    const response = await api.get('/v1/dashboard/alerts', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener alertas recientes:', error);
    return [];
  }
};

// ==================== REPORTES Y EXPORTACIÓN ====================

export const generateReport = async (reportType, params = {}) => {
  try {
    const response = await api.post('/v1/dashboard/generate-report', {
      report_type: reportType,
      ...params
    });
    return response.data;
  } catch (error) {
    console.error('Error al generar reporte:', error);
    throw error;
  }
};

export const exportDashboardData = async (format = 'csv', filters = {}) => {
  try {
    const response = await api.post('/v1/dashboard/export', {
      format,
      filters
    }, {
      responseType: format === 'pdf' ? 'blob' : 'json'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar datos:', error);
    throw error;
  }
};

export const scheduledReport = async (reportConfig) => {
  try {
    const response = await api.post('/v1/dashboard/schedule-report', reportConfig);
    return response.data;
  } catch (error) {
    console.error('Error al programar reporte:', error);
    throw error;
  }
};

// ==================== COMPARACIONES Y ANÁLISIS AVANZADO ====================

export const comparePerformance = async (period1, period2) => {
  try {
    const response = await api.get('/v1/dashboard/compare', {
      params: {
        period1,
        period2
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al comparar rendimiento:', error);
    return {
      period1_data: {},
      period2_data: {},
      changes: {}
    };
  }
};

export const getPredictions = async (metric, horizon = '7d') => {
  try {
    const response = await api.get('/v1/dashboard/predictions', {
      params: { metric, horizon }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener predicciones:', error);
    return {
      predictions: [],
      confidence: 0
    };
  }
};

export const getAnomalies = async (dateFrom = null, dateTo = null) => {
  try {
    const params = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    
    const response = await api.get('/v1/dashboard/anomalies', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener anomalías:', error);
    return [];
  }
};

// ==================== FILTROS Y BÚSQUEDA AVANZADA ====================

export const filterDashboardData = async (filters) => {
  try {
    const response = await api.post('/v1/dashboard/filter', filters);
    return response.data;
  } catch (error) {
    console.error('Error al filtrar datos:', error);
    throw error;
  }
};

export const saveDashboardView = async (viewName, config) => {
  try {
    const response = await api.post('/v1/dashboard/views', {
      name: viewName,
      config
    });
    return response.data;
  } catch (error) {
    console.error('Error al guardar vista:', error);
    throw error;
  }
};

export const getSavedDashboardViews = async () => {
  try {
    const response = await api.get('/v1/dashboard/views');
    return response.data;
  } catch (error) {
    console.error('Error al obtener vistas guardadas:', error);
    return [];
  }
};

export const deleteDashboardView = async (viewId) => {
  try {
    const response = await api.delete(`/v1/dashboard/views/${viewId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar vista:', error);
    throw error;
  }
};

// ==================== WIDGETS DEL DASHBOARD ====================

export const getWidgetData = async (widgetType, params = {}) => {
  try {
    const response = await api.get(`/v1/dashboard/widgets/${widgetType}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener datos del widget ${widgetType}:`, error);
    return null;
  }
};

export const updateWidgetConfig = async (widgetId, config) => {
  try {
    const response = await api.put(`/v1/dashboard/widgets/${widgetId}/config`, config);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar configuración del widget:', error);
    throw error;
  }
};

// ==================== NOTIFICACIONES Y ALERTAS ====================

export const getNotifications = async () => {
  try {
    const response = await api.get('/v1/dashboard/notifications');
    return response.data;
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/v1/dashboard/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
};

export const createAlert = async (alertConfig) => {
  try {
    const response = await api.post('/v1/dashboard/alerts', alertConfig);
    return response.data;
  } catch (error) {
    console.error('Error al crear alerta:', error);
    throw error;
  }
};

export const updateAlert = async (alertId, config) => {
  try {
    const response = await api.put(`/v1/dashboard/alerts/${alertId}`, config);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar alerta:', error);
    throw error;
  }
};

export const deleteAlert = async (alertId) => {
  try {
    const response = await api.delete(`/v1/dashboard/alerts/${alertId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar alerta:', error);
    throw error;
  }
};

// ... código existente ...

// ==================== PANEL DE ADMINISTRACIÓN ====================

export const assignUserRole = async (userId, role) => {
  try {
    const response = await api.put(`/v1/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('Error al asignar rol:', error);
    throw error;
  }
};

export const getAllUsersAdmin = async (filters = {}) => {
  try {
    const response = await api.get('/v1/admin/users', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios (admin):', error);
    throw error;
  }
};

export const getUserDetails = async (userId) => {
  try {
    const response = await api.get(`/v1/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalles del usuario:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const response = await api.put(`/v1/admin/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar estado del usuario:', error);
    throw error;
  }
};

export const banUser = async (userId, reason = '') => {
  try {
    const response = await api.post(`/v1/admin/users/${userId}/ban`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error al banear usuario:', error);
    throw error;
  }
};

export const unbanUser = async (userId) => {
  try {
    const response = await api.post(`/v1/admin/users/${userId}/unban`);
    return response.data;
  } catch (error) {
    console.error('Error al desbanear usuario:', error);
    throw error;
  }
};

export const deleteUserAccount = async (userId, permanent = false) => {
  try {
    const response = await api.delete(`/v1/admin/users/${userId}`, {
      params: { permanent }
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

export const restoreUserAccount = async (userId) => {
  try {
    const response = await api.post(`/v1/admin/users/${userId}/restore`);
    return response.data;
  } catch (error) {
    console.error('Error al restaurar usuario:', error);
    throw error;
  }
};

export const resetUserPassword = async (userId) => {
  try {
    const response = await api.post(`/v1/admin/users/${userId}/reset-password`);
    return response.data;
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    throw error;
  }
};

export const sendUserNotification = async (userId, notification) => {
  try {
    const response = await api.post(`/v1/admin/users/${userId}/notify`, notification);
    return response.data;
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    throw error;
  }
};

export const getUserActivity = async (userId, dateFrom = null, dateTo = null) => {
  try {
    const params = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    
    const response = await api.get(`/v1/admin/users/${userId}/activity`, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener actividad del usuario:', error);
    throw error;
  }
};

export const getUserSessions = async (userId) => {
  try {
    const response = await api.get(`/v1/admin/users/${userId}/sessions`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener sesiones del usuario:', error);
    throw error;
  }
};

export const terminateUserSession = async (userId, sessionId) => {
  try {
    const response = await api.delete(`/v1/admin/users/${userId}/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error al terminar sesión:', error);
    throw error;
  }
};

export const impersonateUser = async (userId) => {
  try {
    const response = await api.post(`/v1/admin/users/${userId}/impersonate`);
    return response.data;
  } catch (error) {
    console.error('Error al impersonar usuario:', error);
    throw error;
  }
};

export const stopImpersonation = async () => {
  try {
    const response = await api.post('/v1/admin/impersonate/stop');
    return response.data;
  } catch (error) {
    console.error('Error al detener impersonación:', error);
    throw error;
  }
};

// ==================== GESTIÓN DE CONTENIDO ====================

export const moderateContent = async (contentType, contentId, action, reason = '') => {
  try {
    const response = await api.post('/v1/admin/moderate', {
      content_type: contentType,
      content_id: contentId,
      action,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error al moderar contenido:', error);
    throw error;
  }
};

export const getFlaggedContent = async () => {
  try {
    const response = await api.get('/v1/admin/flagged-content');
    return response.data;
  } catch (error) {
    console.error('Error al obtener contenido reportado:', error);
    throw error;
  }
};

export const resolveFlaggedContent = async (flagId, resolution) => {
  try {
    const response = await api.post(`/v1/admin/flagged-content/${flagId}/resolve`, {
      resolution
    });
    return response.data;
  } catch (error) {
    console.error('Error al resolver reporte:', error);
    throw error;
  }
};

export const deleteContent = async (contentType, contentId) => {
  try {
    const response = await api.delete(`/v1/admin/content/${contentType}/${contentId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar contenido:', error);
    throw error;
  }
};

// ==================== CONFIGURACIÓN DEL SISTEMA ====================

export const getSystemSettings = async () => {
  try {
    const response = await api.get('/v1/admin/settings');
    return response.data;
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    throw error;
  }
};

export const updateSystemSettings = async (settings) => {
  try {
    const response = await api.put('/v1/admin/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    throw error;
  }
};

export const getFeatureFlags = async () => {
  try {
    const response = await api.get('/v1/admin/feature-flags');
    return response.data;
  } catch (error) {
    console.error('Error al obtener feature flags:', error);
    throw error;
  }
};

export const toggleFeatureFlag = async (flagName, enabled) => {
  try {
    const response = await api.put(`/v1/admin/feature-flags/${flagName}`, { enabled });
    return response.data;
  } catch (error) {
    console.error('Error al cambiar feature flag:', error);
    throw error;
  }
};

export const getSystemLogs = async (level = 'all', limit = 100) => {
  try {
    const response = await api.get('/v1/admin/logs', {
      params: { level, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener logs:', error);
    throw error;
  }
};

export const clearSystemLogs = async (olderThan = null) => {
  try {
    const response = await api.delete('/v1/admin/logs', {
      params: { older_than: olderThan }
    });
    return response.data;
  } catch (error) {
    console.error('Error al limpiar logs:', error);
    throw error;
  }
};

export const getAuditLog = async (filters = {}) => {
  try {
    const response = await api.get('/v1/admin/audit-log', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error al obtener log de auditoría:', error);
    throw error;
  }
};

export const createAuditEntry = async (entry) => {
  try {
    const response = await api.post('/v1/admin/audit-log', entry);
    return response.data;
  } catch (error) {
    console.error('Error al crear entrada de auditoría:', error);
    throw error;
  }
};

// ==================== BACKUPS Y MANTENIMIENTO ====================

export const createBackup = async (includeFiles = true) => {
  try {
    const response = await api.post('/v1/admin/backup', { include_files: includeFiles });
    return response.data;
  } catch (error) {
    console.error('Error al crear backup:', error);
    throw error;
  }
};

export const getBackups = async () => {
  try {
    const response = await api.get('/v1/admin/backups');
    return response.data;
  } catch (error) {
    console.error('Error al obtener backups:', error);
    throw error;
  }
};

export const restoreBackup = async (backupId) => {
  try {
    const response = await api.post(`/v1/admin/backups/${backupId}/restore`);
    return response.data;
  } catch (error) {
    console.error('Error al restaurar backup:', error);
    throw error;
  }
};

export const deleteBackup = async (backupId) => {
  try {
    const response = await api.delete(`/v1/admin/backups/${backupId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar backup:', error);
    throw error;
  }
};

export const runMaintenance = async (tasks = []) => {
  try {
    const response = await api.post('/v1/admin/maintenance', { tasks });
    return response.data;
  } catch (error) {
    console.error('Error al ejecutar mantenimiento:', error);
    throw error;
  }
};

export const getDatabaseStats = async () => {
  try {
    const response = await api.get('/v1/admin/database/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de BD:', error);
    throw error;
  }
};

export const optimizeDatabase = async () => {
  try {
    const response = await api.post('/v1/admin/database/optimize');
    return response.data;
  } catch (error) {
    console.error('Error al optimizar BD:', error);
    throw error;
  }
};

export const clearCache = async (cacheType = 'all') => {
  try {
    const response = await api.post('/v1/admin/cache/clear', { cache_type: cacheType });
    return response.data;
  } catch (error) {
    console.error('Error al limpiar caché:', error);
    throw error;
  }
};

// ==================== ESTADÍSTICAS ADMINISTRATIVAS ====================

export const getAdminStats = async () => {
  try {
    const response = await api.get('/v1/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas admin:', error);
    return {
      total_users: 0,
      active_users: 0,
      total_sessions: 0,
      storage_used: 0
    };
  }
};

export const getServerInfo = async () => {
  try {
    const response = await api.get('/v1/admin/server-info');
    return response.data;
  } catch (error) {
    console.error('Error al obtener info del servidor:', error);
    return {
      cpu_usage: 0,
      memory_usage: 0,
      disk_usage: 0,
      uptime: 0
    };
  }
};

export const getPerformanceMetrics = async () => {
  try {
    const response = await api.get('/v1/admin/performance');
    return response.data;
  } catch (error) {
    console.error('Error al obtener métricas de rendimiento:', error);
    throw error;
  }
};

// ==================== ROLES Y PERMISOS AVANZADOS ====================

export const getRoles = async () => {
  try {
    const response = await api.get('/v1/admin/roles');
    return response.data;
  } catch (error) {
    console.error('Error al obtener roles:', error);
    throw error;
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await api.post('/v1/admin/roles', roleData);
    return response.data;
  } catch (error) {
    console.error('Error al crear rol:', error);
    throw error;
  }
};

export const updateRole = async (roleId, roleData) => {
  try {
    const response = await api.put(`/v1/admin/roles/${roleId}`, roleData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    throw error;
  }
};

export const deleteRole = async (roleId) => {
  try {
    const response = await api.delete(`/v1/admin/roles/${roleId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    throw error;
  }
};

export const getRolePermissions = async (roleId) => {
  try {
    const response = await api.get(`/v1/admin/roles/${roleId}/permissions`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener permisos del rol:', error);
    throw error;
  }
};

export const updateRolePermissions = async (roleId, permissions) => {
  try {
    const response = await api.put(`/v1/admin/roles/${roleId}/permissions`, { permissions });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar permisos:', error);
    throw error;
  }
};

export const getAllPermissions = async () => {
  try {
    const response = await api.get('/v1/admin/permissions');
    return response.data;
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    throw error;
  }
};

// ==================== ANUNCIOS Y MENSAJES DEL SISTEMA ====================

export const getSystemAnnouncements = async () => {
  try {
    const response = await api.get('/v1/admin/announcements');
    return response.data;
  } catch (error) {
    console.error('Error al obtener anuncios:', error);
    throw error;
  }
};

export const createAnnouncement = async (announcement) => {
  try {
    const response = await api.post('/v1/admin/announcements', announcement);
    return response.data;
  } catch (error) {
    console.error('Error al crear anuncio:', error);
    throw error;
  }
};

export const updateAnnouncement = async (announcementId, data) => {
  try {
    const response = await api.put(`/v1/admin/announcements/${announcementId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar anuncio:', error);
    throw error;
  }
};

export const deleteAnnouncement = async (announcementId) => {
  try {
    const response = await api.delete(`/v1/admin/announcements/${announcementId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar anuncio:', error);
    throw error;
  }
};

export const broadcastMessage = async (message, targetUsers = 'all') => {
  try {
    const response = await api.post('/v1/admin/broadcast', {
      message,
      target_users: targetUsers
    });
    return response.data;
  } catch (error) {
    console.error('Error al enviar mensaje broadcast:', error);
    throw error;
  }
};

// ==================== INTEGRACIONES ====================

export const getIntegrations = async () => {
  try {
    const response = await api.get('/v1/admin/integrations');
    return response.data;
  } catch (error) {
    console.error('Error al obtener integraciones:', error);
    throw error;
  }
};

export const enableIntegration = async (integrationName, config) => {
  try {
    const response = await api.post(`/v1/admin/integrations/${integrationName}/enable`, config);
    return response.data;
  } catch (error) {
    console.error('Error al habilitar integración:', error);
    throw error;
  }
};

export const disableIntegration = async (integrationName) => {
  try {
    const response = await api.post(`/v1/admin/integrations/${integrationName}/disable`);
    return response.data;
  } catch (error) {
    console.error('Error al deshabilitar integración:', error);
    throw error;
  }
};

export const testIntegration = async (integrationName) => {
  try {
    const response = await api.post(`/v1/admin/integrations/${integrationName}/test`);
    return response.data;
  } catch (error) {
    console.error('Error al probar integración:', error);
    throw error;
  }
};

// Exportar todo por defecto
export default api;