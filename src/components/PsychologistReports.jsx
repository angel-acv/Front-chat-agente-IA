import React, { useState, useEffect } from 'react';
import { FileText, User, Calendar, Search, Filter, Download } from 'lucide-react';
import { getAllUsersHistory } from '../services/api';
import dayjs from 'dayjs';

export default function PsychologistReports() {
  const [allHistory, setAllHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    loadAllHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterUser, filterDate, allHistory]);

  const loadAllHistory = async () => {
    try {
      setLoading(true);
      const data = await getAllUsersHistory();
      setAllHistory(data || []);
    } catch (error) {
      console.error('Error al cargar historiales:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allHistory];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.response?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por usuario
    if (filterUser) {
      filtered = filtered.filter(item =>
        item.username?.toLowerCase().includes(filterUser.toLowerCase())
      );
    }

    // Filtrar por fecha
    if (filterDate) {
      filtered = filtered.filter(item =>
        dayjs(item.timestamp).format('YYYY-MM-DD') === filterDate
      );
    }

    setFilteredHistory(filtered);
  };

  const getUniqueUsers = () => {
    const users = [...new Set(allHistory.map(item => item.username))];
    return users.filter(Boolean).sort();
  };

  const exportToCSV = () => {
    const headers = ['Usuario', 'Fecha', 'Hora', 'Mensaje', 'Respuesta', 'Modo'];
    const rows = filteredHistory.map(item => [
      item.username || 'Invitado',
      dayjs(item.timestamp).format('YYYY-MM-DD'),
      dayjs(item.timestamp).format('HH:mm:ss'),
      item.message?.replace(/"/g, '""') || '',
      item.response?.replace(/"/g, '""') || '',
      item.mode || 'standard'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_psicologico_${dayjs().format('YYYY-MM-DD')}.csv`;
    link.click();
  };

  const groupByUser = () => {
    const grouped = {};
    filteredHistory.forEach(item => {
      const user = item.username || 'Invitado';
      if (!grouped[user]) {
        grouped[user] = [];
      }
      grouped[user].push(item);
    });
    return grouped;
  };

  const groupedData = groupByUser();

  if (loading) {
    return (
      <div className="section-card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando reportes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Reportes de Usuarios
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Historial completo de conversaciones de todos los usuarios
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn-primary flex items-center gap-2"
          disabled={filteredHistory.length === 0}
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            <Search className="w-4 h-4 inline mr-1" />
            Buscar en mensajes
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Filtrar por usuario
          </label>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="input-field"
          >
            <option value="">Todos los usuarios</option>
            {getUniqueUsers().map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Filtrar por fecha
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Conversaciones</div>
          <div className="text-2xl font-bold text-blue-600">{filteredHistory.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Usuarios Únicos</div>
          <div className="text-2xl font-bold text-green-600">{Object.keys(groupedData).length}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Hoy</div>
          <div className="text-2xl font-bold text-purple-600">
            {filteredHistory.filter(item => 
              dayjs(item.timestamp).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
            ).length}
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Esta Semana</div>
          <div className="text-2xl font-bold text-orange-600">
            {filteredHistory.filter(item => 
              dayjs(item.timestamp).isAfter(dayjs().subtract(7, 'days'))
            ).length}
          </div>
        </div>
      </div>

      {/* Lista de conversaciones agrupadas por usuario */}
      <div className="space-y-4">
        {Object.keys(groupedData).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron conversaciones con los filtros aplicados
          </div>
        ) : (
          Object.entries(groupedData).map(([username, conversations]) => (
            <div key={username} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{username}</h3>
                  <span className="text-sm text-gray-600">
                    ({conversations.length} conversaciones)
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {conversations.map((conv, idx) => (
                  <div
                    key={idx}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {dayjs(conv.timestamp).format('DD/MM/YYYY HH:mm:ss')}
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {conv.mode || 'standard'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Mensaje:</span>
                        <p className="text-gray-700 mt-1">{conv.message}</p>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Respuesta:</span>
                        <p className="text-gray-700 mt-1">{conv.response}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de detalle (opcional) */}
      {selectedConversation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedConversation(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Detalle de Conversación</h3>
            <div className="space-y-4">
              <div>
                <span className="font-medium">Usuario:</span>
                <p className="text-gray-700">{selectedConversation.username || 'Invitado'}</p>
              </div>
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
                <span className="font-medium">Mensaje:</span>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedConversation.message}</p>
              </div>
              <div>
                <span className="font-medium">Respuesta:</span>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedConversation.response}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedConversation(null)}
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