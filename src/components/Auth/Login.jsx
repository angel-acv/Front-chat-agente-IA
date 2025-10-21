import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, User, Lock, Eye, EyeOff } from 'lucide-react';
import { login } from '../../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await login(formData);
      toast.success(`¡Bienvenido/a ${response.user.username}!`);
      navigate('/chat');
    } catch (error) {
      console.error('Error en login:', error);
      const errorMessage = error.detail || error.message || 'Error al iniciar sesión';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
              Regístrate gratis
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.username ? 'border-red-500' : ''}`}
                  placeholder="tu_usuario"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full flex justify-center items-center gap-2 py-3 px-4 
                border border-transparent rounded-lg shadow-sm text-sm font-medium 
                text-white bg-gradient-to-r from-primary to-primary-dark 
                hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-primary transition-all duration-200
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Iniciar sesión
                </>
              )}
            </button>
          </div>

          {/* Guest Access */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/chat')}
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              Continuar como invitado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}