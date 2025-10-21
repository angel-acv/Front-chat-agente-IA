import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Settings, Database, Activity, 
  AlertTriangle, FileText, Clock, TrendingUp, Download 
} from 'lucide-react';
import {
  assignUserRole,
  getAllUsersAdmin,
  getUserDetails,
  updateUserStatus,
  banUser,
  unbanUser,
  getAdminStats,
  getServerInfo,
  getSystemSettings,
  updateSystemSettings,
  getAuditLog,
  createBackup,
  getBackups,
  getDatabaseStats,
  clearCache,
  getSystemLogs
} from '../services/api';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [serverInfo, setServerInfo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [adminStats, server] = await Promise.all([
        getAdminStats(),
        getServerInfo()
      ]);
      
      setStats(adminStats);
      setServerInfo(server);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar panel de administración');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await getAllUsersAdmin();
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    }
  };

  const loadLogs = async () => {
    try {
      const logsData = await getSystemLogs('all', 50);
      setLogs(logsData || []);
    } catch (error) {
      console.error('Error al cargar logs:', error);
      toast.error('Error al cargar logs');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await assignUserRole(userId, newRole);
      toast.success('Rol actualizado exitosamente');
      loadUsers();
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      toast.error('Error al actualizar rol');
    }
  };

  const handleBanUser = async (userId) => {
    if (!confirm('¿Estás seguro de que quieres banear a este usuario?')) {
      return;
    }

    try {
      await banUser(userId, 'Violación de términos de servicio');
      toast.success('Usuario baneado');
      loadUsers();
    } catch (error) {
      console.error('Error al banear usuario:', error);
      toast.error('Error al banear usuario');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await unbanUser(userId);
      toast.success('Usuario desbaneado');
      loadUsers();
    } catch (error) {
      console.error('Error al desbanear usuario:', error);
      toast.error('Error al desbanear usuario');
    }
  };

  const handleCreateBackup = async () => {
    try {
      toast.loading('Creando backup...', { id: 'backup' });
      await createBackup(true);
      toast.success('Backup creado exitosamente', { id: 'backup' });
    } catch (error) {
      console.error('Error al crear backup:', error);
      toast.error('Error al crear backup', { id: 'backup' });
    }
  };

  const handleClearCache = async () => {
    try {
      toast.loading('Limpiando caché...', { id: 'cache' });
      await clearCache('all');
      toast.success('Caché limpiado', { id: 'cache' });
    } catch (error) {
      console.error('Error al limpiar caché:', error);
      toast.error('Error al limpiar caché', { id: 'cache' });
    }
  };

  if (loading) {
    return (
      <div className="section-card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando panel...</span>
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
              <Shield className="w-6 h-6" />
              Panel de Administración
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Control total del sistema
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateBackup}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Backup
            </button>
            <button
              onClick={handleClearCache}
              className="btn-secondary"
            >
              Limpiar Caché
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-6">
            {[
              { id: 'overview', label: 'Resumen', icon: Activity },
              { id: 'users', label: 'Usuarios', icon: Users },
              { id: 'system', label: 'Sistema', icon: Settings },
              { id: 'database', label: 'Base de Datos', icon: Database },
              { id: 'logs', label: 'Logs', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTab(tab.id);
                  if (tab.id === 'users') loadUsers();
                  if (tab.id === 'logs') loadLogs();
                }}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm
                  ${selectedTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {selectedTab === 'overview' && stats && serverInfo && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Total Usuarios</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.total_users || 0}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Usuarios Activos</div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.active_users || 0}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Sesiones Totales</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.total_sessions || 0}
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Almacenamiento</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {((stats.storage_used || 0) / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Estado del Servidor</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CPU</span>
                      <span className="font-semibold">{serverInfo.cpu_usage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 rounded-full h-2"
                        style={{ width: `${serverInfo.cpu_usage}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memoria</span>
                      <span className="font-semibold">{serverInfo.memory_usage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 rounded-full h-2"
                        style={{ width: `${serverInfo.memory_usage}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Disco</span>
                      <span className="font-semibold">{serverInfo.disk_usage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 rounded-full h-2"
                        style={{ width: `${serverInfo.disk_usage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Uptime</h3>
                  <div className="text-3xl font-bold text-primary">
                    {Math.floor((serverInfo.uptime || 0) / 3600)}h {Math.floor(((serverInfo.uptime || 0) % 3600) / 60)}m
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Sistema operando sin interrupciones</p>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {selectedTab === 'users' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="font-semibold">Gestión de Usuarios</h3>
                <button onClick={loadUsers} className="btn-secondary">
                  Recargar
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Rol</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                          Carga los usuarios para ver la lista
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{user.username}</td>
                          <td className="px-4 py-3">{user.email || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="input-field py-1 text-sm"
                            >
                              <option value="user">Usuario</option>
                              <option value="psychologist">Psicólogo</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {user.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {user.is_active ? (
                              <button
                                onClick={() => handleBanUser(user.id)}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Banear
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnbanUser(user.id)}
                                className="text-green-600 hover:text-green-700 text-sm"
                              >
                                Desbanear
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* System Tab */}
          {selectedTab === 'system' && (
            <div className="text-center py-8 text-gray-500">
              Configuración del sistema en desarrollo
            </div>
          )}

          {/* Database Tab */}
          {selectedTab === 'database' && (
            <div className="text-center py-8 text-gray-500">
              Gestión de base de datos en desarrollo
            </div>
          )}

          {/* Logs Tab */}
          {selectedTab === 'logs' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="font-semibold">Logs del Sistema</h3>
                <button onClick={loadLogs} className="btn-secondary">
                  Recargar
                </button>
              </div>
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Carga los logs para verlos aquí
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.map((log, idx) => (
                    <div key={idx} className="text-xs bg-gray-50 p-2 rounded font-mono">
                      <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                      <span className={`font-semibold ${
                        log.level === 'error' ? 'text-red-600' :
                        log.level === 'warning' ? 'text-orange-600' :
                        log.level === 'info' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {log.level?.toUpperCase()}
                      </span>{' '}
                      {log.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}