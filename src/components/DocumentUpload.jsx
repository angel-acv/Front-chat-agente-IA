import React, { useState, useEffect } from 'react';
import { Upload, File, Trash2, Eye, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  uploadDocument, 
  getDocuments, 
  deleteDocument, 
  extractKeywordsFromDocument,
  getDocumentKeywords,
  processDocument,
  downloadDocument
} from '../services/api';
import toast from 'react-hot-toast';

export default function DocumentUpload() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [keywords, setKeywords] = useState([]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await getDocuments();
      setDocuments(data || []);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 10MB');
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'text/markdown'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de archivo no permitido. Solo PDF, Word, TXT y Markdown');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecciona un archivo primero');
      return;
    }

    try {
      setUploading(true);
      const metadata = {
        title: selectedFile.name,
        description: 'Documento subido desde la interfaz'
      };

      await uploadDocument(selectedFile, metadata);
      toast.success('Documento subido exitosamente');
      setSelectedFile(null);
      loadDocuments();
      
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error al subir documento:', error);
      toast.error('Error al subir documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }

    try {
      await deleteDocument(docId);
      toast.success('Documento eliminado');
      loadDocuments();
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      toast.error('Error al eliminar documento');
    }
  };

  const handleExtractKeywords = async (docId) => {
    try {
      const result = await extractKeywordsFromDocument(docId);
      toast.success('Palabras clave extraídas exitosamente');
      
      // Cargar palabras clave
      const keywordsData = await getDocumentKeywords(docId);
      setKeywords(keywordsData || []);
      
      loadDocuments();
    } catch (error) {
      console.error('Error al extraer palabras clave:', error);
      toast.error('Error al extraer palabras clave');
    }
  };

  const handleProcess = async (docId) => {
    try {
      await processDocument(docId);
      toast.success('Documento procesado exitosamente');
      loadDocuments();
    } catch (error) {
      console.error('Error al procesar documento:', error);
      toast.error('Error al procesar documento');
    }
  };

  const handleDownload = async (docId, filename) => {
    try {
      const blob = await downloadDocument(docId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Documento descargado');
    } catch (error) {
      console.error('Error al descargar documento:', error);
      toast.error('Error al descargar documento');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="section-card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando documentos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="section-card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Gestión de Documentos
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Sube y gestiona documentos para análisis
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-input" className="cursor-pointer">
              <span className="btn-primary inline-block">
                Seleccionar archivo
              </span>
              <input
                id="file-input"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.md"
              />
            </label>
          </div>
          {selectedFile && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Archivo seleccionado: <span className="font-medium">{selectedFile.name}</span>
              </p>
              <p className="text-xs text-gray-500">
                Tamaño: {formatFileSize(selectedFile.size)}
              </p>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-3 btn-primary"
              >
                {uploading ? 'Subiendo...' : 'Subir documento'}
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            PDF, Word, TXT, Markdown hasta 10MB
          </p>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Documentos ({documents.length})</h3>
        
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay documentos subidos
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <File className="w-8 h-8 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {doc.title || doc.filename}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(doc.size_bytes)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {doc.extracted ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            Procesado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-orange-600">
                            <AlertCircle className="w-3 h-3" />
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-2">
                    {!doc.extracted && (
                      <button
                        onClick={() => handleProcess(doc.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Procesar"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleExtractKeywords(doc.id)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                      title="Extraer palabras clave"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc.id, doc.filename)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                      title="Descargar"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Keywords Modal */}
      {keywords.length > 0 && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-semibold mb-2">Palabras clave extraídas:</h4>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white border border-purple-200 rounded-full text-sm"
              >
                {kw.keyword} {kw.weight && `(${kw.weight.toFixed(2)})`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}