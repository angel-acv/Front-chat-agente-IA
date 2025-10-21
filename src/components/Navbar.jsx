import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, LogOut, Menu, X, User, ChevronDown, Shield } from 'lucide-react';
import { getUserInfo, logout } from '../services/api';
import { getNavigationItems, ROLES } from '../utils/permissions';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const u = getUserInfo();
    setUser(u);
  }, [location]);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/login');
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const getRoleLabel = (role) => {
    const labels = {
      [ROLES.GUEST]: 'Invitado',
      [ROLES.USER]: 'Usuario',
      [ROLES.PSYCHOLOGIST]: 'Psicólogo',
      [ROLES.ADMIN]: 'Administrador'
    };
    return labels[role] || 'Invitado';
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      [ROLES.GUEST]: 'bg-gray-100 text-gray-700 border-gray-300',
      [ROLES.USER]: 'bg-blue-50 text-blue-700 border-blue-200',
      [ROLES.PSYCHOLOGIST]: 'bg-purple-50 text-purple-700 border-purple-200',
      [ROLES.ADMIN]: 'bg-red-50 text-red-700 border-red-200'
    };
    return classes[role] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getRoleIcon = (role) => {
    if (role === ROLES.ADMIN || role === ROLES.PSYCHOLOGIST) {
      return <Shield className="w-3 h-3" />;
    }
    return <User className="w-3 h-3" />;
  };

  // Obtener los items de navegación según el rol
  const userRole = user?.role || ROLES.GUEST;
  const navigationItems = getNavigationItems(userRole);

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <Link 
            to="/chat" 
            className="flex items-center gap-3 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-sm group-hover:blur-md transition-all"></div>
              <div className="relative bg-gradient-to-br from-primary to-primary-dark p-2 rounded-lg shadow-lg group-hover:shadow-xl transition-all">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Chat Clínico
              </h1>
              <p className="text-xs text-gray-500">Asistente de Salud Mental</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                  ${location.pathname === item.path
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Section - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200"
                >
                  {/* Avatar */}
                  <div className={`relative w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white shadow-md ${
                    userRole === ROLES.ADMIN ? 'bg-gradient-to-br from-red-500 to-red-600' :
                    userRole === ROLES.PSYCHOLOGIST ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                    'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    {user.username?.[0]?.toUpperCase()}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  {/* User Info */}
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-800">
                      {user.username}
                    </div>
                    <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${getRoleBadgeClass(userRole)}`}>
                      {getRoleIcon(userRole)}
                      <span className="font-medium">{getRoleLabel(userRole)}</span>
                    </div>
                  </div>
                  
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setUserMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email || 'Sin email'}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-primary-dark rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? 
              <X className="w-6 h-6 text-gray-700" /> : 
              <Menu className="w-6 h-6 text-gray-700" />
            }
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-3 space-y-2">
            {/* User Info - Mobile */}
            {user && (
              <div className="pb-3 mb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md ${
                    userRole === ROLES.ADMIN ? 'bg-gradient-to-br from-red-500 to-red-600' :
                    userRole === ROLES.PSYCHOLOGIST ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                    'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{user.username}</div>
                    <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border mt-1 ${getRoleBadgeClass(userRole)}`}>
                      {getRoleIcon(userRole)}
                      <span className="font-medium">{getRoleLabel(userRole)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Items - Mobile */}
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block px-4 py-3 rounded-lg font-medium transition-all
                  ${location.pathname === item.path
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}

            {/* Auth Buttons - Mobile */}
            <div className="pt-3 border-t border-gray-200 space-y-2">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-center font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-center font-medium text-white bg-gradient-to-r from-primary to-primary-dark rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}