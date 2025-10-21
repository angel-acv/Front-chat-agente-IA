import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, MessageCircle, Activity, TrendingUp, 
  AlertTriangle, Clock, Calendar, Download 
} from 'lucide-react';
import {
  getDashboardData,
  getSymptomTrends,
  getUserActivityStats,
  getConversationMetrics,
  getSentimentAnalysis,
  getTopSymptoms,
  getCrisisDetections,
  getUserGrowthStats,
  getEngagementMetrics,
  getSystemHealth
} from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [symptomTrends, setSymptomTrends] = useState([]);
  const [userActivity, setUserActivity] = useState(null);
  const [conversationMetrics, setConversationMetrics] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [topSymptoms, setTopSymptoms] = useState([]);
  const [crisisData, setCrisisData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        dashData,
        trends,
        activity,
        metrics,
        sentimentData,
        symptoms,
        crisis
      ] = await Promise.all([
        getDashboardData(),
        getSymptomTrends(),
        getUserActivityStats(selectedPeriod),
        getConversationMetrics(),
        getSentimentAnalysis(selectedPeriod),
        getTopSymptoms(10),
        getCrisisDetections()
      ]);

      setDashboardData(dashData);
      setSymptomTrends(trends || []);
      setUserActivity(activity);
      setConversationMetrics(metrics);
      setSentiment(sentimentData);
      setTopSymptoms(symptoms || []);
      setCrisisData(crisis || []);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  if (loading) {
    return (
      <div className="section-card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Dashboard
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Panel de control y métricas del sistema
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field"
            >
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>
            <button className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatNumber(dashboardData?.total_users || 0)}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-semibold">+12%</span>
            <span className="text-gray-600 ml-1">vs período anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sesiones Activas</p>
              <p className="text-3xl font-bold text-green-600">
                {formatNumber(dashboardData?.total_sessions || 0)}
              </p>
            </div>
            <MessageCircle className="w-12 h-12 text-green-500 opacity-20" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Activity className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-semibold">
              {dashboardData?.active_users_today || 0}
            </span>
            <span className="text-gray-600 ml-1">activos hoy</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Mensajes</p>
              <p className="text-3xl font-bold text-purple-600">
                {formatNumber(dashboardData?.total_messages || 0)}
              </p>
            </div>
            <MessageCircle className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Clock className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-gray-600">
              {conversationMetrics?.average_length || 0} promedio/sesión
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alertas de Crisis</p>
              <p className="text-3xl font-bold text-red-600">
                {crisisData?.length || 0}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-500 opacity-20" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Calendar className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-gray-600">En el período seleccionado</span>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencias de síntomas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Tendencias de Síntomas</h3>
          {symptomTrends.length > 0 ? (
            <div className="space-y-3">
              {symptomTrends.map((symptom, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{symptom.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${symptom.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">
                      {symptom.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay datos de tendencias
            </div>
          )}
        </div>

        {/* Análisis de sentimiento */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Análisis de Sentimiento</h3>
          {sentiment ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Positivo</span>
                <span className="text-green-600 font-semibold">
                  {sentiment.positive}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Neutral</span>
                <span className="text-blue-600 font-semibold">
                  {sentiment.neutral}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Negativo</span>
                <span className="text-red-600 font-semibold">
                  {sentiment.negative}%
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay datos de sentimiento
            </div>
          )}
        </div>
      </div>

      {/* Síntomas más detectados */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Síntomas Más Detectados</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {topSymptoms.map((symptom, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 text-center"
            >
              <div className="text-2xl font-bold text-primary">
                {symptom.count}
              </div>
              <div className="text-sm text-gray-600 mt-1">{symptom.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}