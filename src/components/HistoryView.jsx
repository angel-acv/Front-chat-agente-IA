import React, { useState, useEffect } from 'react';
import { History, MessageCircle, Clock, Search, Filter, Trash2, Eye } from 'lucide-react';
import { getHistory, getConversationSummary, deleteSession } from '../services/api';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function HistoryView() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationSummary, setConversationSummary] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, history]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getHistory();
      setHistory(data || []);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      toast.error('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!searchTerm) {
      setFilteredHistory(history);
      return;
    }

    const filtered = history.filter(item =>
      item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.response?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHistory(filtered);
  };

  const handleViewDetails = async (conversation) => {
    setSelectedConversation(conversation);
    
    // Intentar cargar resumen si existe
    if (conversation.session_id) {
      try {
        const summary = await getConversationSummary(conversation.session_id);
        setConversationSummary(summary);
      } catch (error) {
        console.log('No se pudo cargar el resumen');
        setConversationSummary(null);
      }
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      return;
    }

    try {
      await deleteSession(sessionId);
      toast.success('Conversación eliminada');
      loadHistory();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar la conversación');
    }
  };

  const groupByDate = () => {
    const grouped = {};
    filteredHistory.forEach(item => {
      const date = dayjs(item.timestamp).format('YYYY-MM-DD');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };

  const groupedData = groupByDate();

  if (loading) {
    return (
      <div className="section-card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando historial...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6" />
            Mi Historial
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Historial de tus conversaciones
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en el historial..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Conversaciones</div>
          <div className="text-2xl font-bold text-blue-600">{filteredHistory.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Hoy</div>
          <div className="text-2xl font-bold text-green-600">
            {filteredHistory.filter(item => 
              dayjs(item.timestamp).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
            ).length}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Esta Semana</div>
          <div className="text-2xl font-bold text-purple-600">
            {filteredHistory.filter(item => 
              dayjs(item.timestamp).isAfter(dayjs().subtract(7, 'days'))
            ).length}
          </div>
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="space-y-4">
        {Object.keys(groupedData).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron conversaciones
          </div>
        ) : (
          Object.entries(groupedData).map(([date, conversations]) => (
            <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700">
                {dayjs(date).format('DD MMMM YYYY')}
              </div>
              <div className="divide-y divide-gray-200">
                {conversations.map((conv, idx) => (
                  <div
                    key={idx}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Clock className="w-4 h-4" />
                          {dayjs(conv.timestamp).format('HH:mm:ss')}
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {conv.mode || 'standard'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Tu mensaje:</span>
                            <p className="text-gray-700 mt-1">{conv.message}</p>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Respuesta:</span>
                            <p className="text-gray-700 mt-1">{conv.response}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleViewDetails(conv)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {conv.session_id && (
                          <button
                            onClick={() => handleDeleteSession(conv.session_id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de detalles */}
      {selectedConversation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedConversation(null);
            setConversationSummary(null);
          }}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Detalle de Conversación</h3>
            <div className="space-y-4">
              <div>
                <span className="font-medium">Fecha:</span>
                <p className="text-gray-700">
                  {dayjs(selectedConversation.timestamp).format('DD/MM/YYYY HH:mm:ss')}
                </p>
              </div>
              <div>
                <span className="font-medium">Modo:</span>
                <p className="text-gray-700">{selectedConversation.mode || 'standard'}</p>
              </div>
              <div>
                <span className="font-medium">Tu mensaje:</span>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedConversation.message}</p>
              </div>
              <div>
                <span className="font-medium">Respuesta:</span>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedConversation.response}</p>
              </div>
              
              {conversationSummary && (
                <div>
                  <span className="font-medium">Resumen:</span>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded">{conversationSummary.summary}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedConversation(null);
                setConversationSummary(null);
              }}
              className="mt-6 btn-primary w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}