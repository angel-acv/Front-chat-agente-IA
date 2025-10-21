import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Trash2, Edit, Save, X, Search, Filter, 
  Download, Upload, CheckCircle, AlertCircle, Copy 
} from 'lucide-react';
import { 
  getSymptomKeywords,
  addSymptomKeyword,
  updateSymptomKeyword,
  deleteSymptomKeyword,
  toggleSymptomKeyword,
  getSymptomTypes,
  getKeywordStats,
  exportKeywordsToFile,
  importKeywordsFromFile,
  searchKeywords,
  duplicateKeyword
} from '../services/api';
import toast from 'react-hot-toast';

export default function LexiconManager() {
  const [keywords, setKeywords] = useState([]);
  const [filteredKeywords, setFilteredKeywords] = useState([]);
  const [symptomTypes, setSymptomTypes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [editingKeyword, setEditingKeyword] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKeyword, setNewKeyword] = useState({
    symptom_type: '',
    keyword: '',
    weight: 1.0,
    source: 'user'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, filterSource, filterActive, keywords]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [keywordsData, typesData, statsData] = await Promise.all([
        getSymptomKeywords(),
        getSymptomTypes(),
        getKeywordStats()
      ]);
      
      setKeywords(keywordsData || []);
      setSymptomTypes(typesData || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar el léxico');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...keywords];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(kw =>
        kw.keyword?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kw.symptom_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo de síntoma
    if (filterType) {
      filtered = filtered.filter(kw => kw.symptom_type === filterType);
    }

    // Filtrar por fuente
    if (filterSource) {
      filtered = filtered.filter(kw => kw.source === filterSource);
    }

    // Filtrar por estado activo
    if (filterActive !== 'all') {
      const isActive = filterActive === 'active';
      filtered = filtered.filter(kw => kw.active === isActive);
    }

    setFilteredKeywords(filtered);
  };

  const handleAdd = async () => {
    if (!newKeyword.symptom_type || !newKeyword.keyword) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    try {
      await addSymptomKeyword(newKeyword);
      toast.success('Palabra clave agregada');
      setNewKeyword({
        symptom_type: '',
        keyword: '',
        weight: 1.0,
        source: 'user'
      });
      setShowAddForm(false);
      loadData();
    } catch (error) {
      console.error('Error al agregar:', error);
      toast.error('Error al agregar palabra clave');
    }
  };

  const handleEdit = (keyword) => {
    setEditingKeyword({ ...keyword });
  };

  const handleSaveEdit = async () => {
    if (!editingKeyword) return;

    try {
      await updateSymptomKeyword(editingKeyword.id, editingKeyword);
      toast.success('Palabra clave actualizada');
      setEditingKeyword(null);
      loadData();
    } catch (error) {
      console.error('Error al actualizar:', error);
      toast.error('Error al actualizar palabra clave');
    }
  };

  const handleDelete = async (keywordId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta palabra clave?')) {
      return;
    }

    try {
      await deleteSymptomKeyword(keywordId);
      toast.success('Palabra clave eliminada');
      loadData();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar palabra clave');
    }
  };

  const handleToggleActive = async (keywordId, currentState) => {
    try {
      await toggleSymptomKeyword(keywordId, !currentState);
      toast.success(`Palabra clave ${!currentState ? 'activada' : 'desactivada'}`);
      loadData();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar estado');
    }
  };

  const handleDuplicate = async (keywordId) => {
    try {
      await duplicateKeyword(keywordId);
      toast.success('Palabra clave duplicada');
      loadData();
    } catch (error) {
      console.error('Error al duplicar:', error);
      toast.error('Error al duplicar palabra clave');
    }
  };

  const handleExport = async (format = 'json') => {
    try {
      const data = await exportKeywordsToFile(format);
      
      if (format === 'csv') {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lexicon_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lexicon_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      toast.success('Léxico exportado');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar léxico');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await importKeywordsFromFile(file);
      toast.success('Léxico importado exitosamente');
      loadData();
    } catch (error) {
      console.error('Error al importar:', error);
      toast.error('Error al importar léxico');
    }
  };

  const getSymptomTypeLabel = (type) => {
    const labels = {
      'ansiedad': 'Ansiedad',
      'depresion': 'Depresión',
      'estres': 'Estrés',
      'panico': 'Pánico',
      'fobia': 'Fobia',
      'obsesivo_compulsivo': 'TOC'
    };
    return labels[type] || type;
  };

  const getSymptomTypeBadgeClass = (type) => {
    const classes = {
      'ansiedad': 'bg-yellow-100 text-yellow-800',
      'depresion': 'bg-blue-100 text-blue-800',
      'estres': 'bg-orange-100 text-orange-800',
      'panico': 'bg-red-100 text-red-800',
      'fobia': 'bg-purple-100 text-purple-800',
      'obsesivo_compulsivo': 'bg-green-100 text-green-800'
    };
    return classes[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="section-card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando léxico...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Gestión de Léxico
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Administra las palabras clave para detección de síntomas
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
          <button
            onClick={() => handleExport('json')}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <label className="btn-secondary flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Importar
            <input
              type="file"
              className="hidden"
              accept=".json,.csv"
              onChange={handleImport}
            />
          </label>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Activas</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Inactivas</div>
            <div className="text-2xl font-bold text-orange-600">{stats.inactive}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Tipos</div>
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(stats.by_type || {}).length}
            </div>
          </div>
        </div>
      )}

      {/* Formulario de agregar */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-4">Nueva Palabra Clave</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Síntoma</label>
              <select
                value={newKeyword.symptom_type}
                onChange={(e) => setNewKeyword({ ...newKeyword, symptom_type: e.target.value })}
                className="input-field"
              >
                <option value="">Seleccionar...</option>
                {symptomTypes.map(type => (
                  <option key={type} value={type}>
                    {getSymptomTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Palabra Clave</label>
              <input
                type="text"
                value={newKeyword.keyword}
                onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                className="input-field"
                placeholder="ej: preocupación, tristeza..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Peso (0.1 - 2.0)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="2.0"
                value={newKeyword.weight}
                onChange={(e) => setNewKeyword({ ...newKeyword, weight: parseFloat(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fuente</label>
              <select
                value={newKeyword.source}
                onChange={(e) => setNewKeyword({ ...newKeyword, source: e.target.value })}
                className="input-field"
              >
                <option value="user">Usuario</option>
                <option value="doc">Documento</option>
                <option value="system">Sistema</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="btn-primary">
              Guardar
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input-field"
        >
          <option value="">Todos los tipos</option>
          {symptomTypes.map(type => (
            <option key={type} value={type}>
              {getSymptomTypeLabel(type)}
            </option>
          ))}
        </select>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="input-field"
        >
          <option value="">Todas las fuentes</option>
          <option value="user">Usuario</option>
          <option value="doc">Documento</option>
          <option value="system">Sistema</option>
        </select>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="input-field"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Solo activas</option>
          <option value="inactive">Solo inactivas</option>
        </select>
      </div>

      {/* Tabla de palabras clave */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Palabra Clave</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Peso</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Fuente</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredKeywords.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No se encontraron palabras clave
                </td>
              </tr>
            ) : (
              filteredKeywords.map((kw) => (
                <tr key={kw.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(kw.id, kw.active)}
                      className={`p-1 rounded ${kw.active ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {kw.active ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {editingKeyword?.id === kw.id ? (
                      <input
                        type="text"
                        value={editingKeyword.keyword}
                        onChange={(e) => setEditingKeyword({ ...editingKeyword, keyword: e.target.value })}
                        className="input-field py-1"
                      />
                    ) : (
                      <span className="font-medium">{kw.keyword}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingKeyword?.id === kw.id ? (
                      <select
                        value={editingKeyword.symptom_type}
                        onChange={(e) => setEditingKeyword({ ...editingKeyword, symptom_type: e.target.value })}
                        className="input-field py-1 text-sm"
                      >
                        {symptomTypes.map(type => (
                          <option key={type} value={type}>
                            {getSymptomTypeLabel(type)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getSymptomTypeBadgeClass(kw.symptom_type)}`}>
                        {getSymptomTypeLabel(kw.symptom_type)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingKeyword?.id === kw.id ? (
                      <input
                        type="number"
                        step="0.1"
                        value={editingKeyword.weight}
                        onChange={(e) => setEditingKeyword({ ...editingKeyword, weight: parseFloat(e.target.value) })}
                        className="input-field py-1 w-20"
                      />
                    ) : (
                      <span className="text-sm">{kw.weight?.toFixed(1)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{kw.source}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {editingKeyword?.id === kw.id ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Guardar"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingKeyword(null)}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(kw)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(kw.id)}
                            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                            title="Duplicar"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(kw.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}