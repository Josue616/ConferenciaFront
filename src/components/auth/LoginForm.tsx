import React, { useState } from 'react';
import { LogIn, User, Lock, Eye, EyeOff, Heart, Users, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { authApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState({ dni: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(credentials);
      login(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white bg-opacity-20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* Geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-white border-opacity-10 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-white border-opacity-10 rounded-lg animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-white bg-opacity-5 rounded-full animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 opacity-10 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo and Title Section */}
          <div className="text-center mb-8 animate-fade-in-down">
            {/* Logo Container */}
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse shadow-2xl shadow-blue-500/25" />
              <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-xl">
                <div className="relative">
                  <Heart className="w-8 h-8 text-red-500 animate-pulse" />
                  <Users className="w-6 h-6 text-blue-600 absolute -top-1 -right-1" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white tracking-wide">
                <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                  RNDC
                </span>
              </h1>
              <p className="text-blue-200 text-lg font-medium">
                Reunidos en Cristo
              </p>
              <p className="text-blue-300 text-sm opacity-90">
                Sistema de Gestión de Conferencias
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl">
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Bienvenido</h2>
                  <p className="text-blue-200">Inicia sesión para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* DNI Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-blue-100">
                      Documento de Identidad
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-blue-300 group-focus-within:text-blue-200 transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={credentials.dni}
                        onChange={(e) => setCredentials(prev => ({ ...prev, dni: e.target.value }))}
                        placeholder="Ingresa tu DNI"
                        className="block w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-blue-100">
                      Contraseña
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-blue-300 group-focus-within:text-blue-200 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Ingresa tu contraseña"
                        className="block w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-300 hover:text-blue-200 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Error Message */}
                  {error && (
                    <div className="animate-shake bg-red-500/20 border border-red-400/30 rounded-xl p-4 backdrop-blur-sm">
                      <p className="text-red-200 text-sm text-center font-medium">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    {loading && (
                      <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <span className={`flex items-center justify-center space-x-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                      <LogIn className="w-5 h-5" />
                      <span>Iniciar Sesión</span>
                    </span>
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                  <div className="flex items-center justify-center space-x-2 text-blue-200 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Sistema de Conferencias Cristianas</span>
                  </div>
                  <p className="text-blue-300 text-xs mt-2 opacity-75">
                    "Donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos"
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
            className="absolute w-2 h-2 bg-white bg-opacity-20 rounded-full"
        }

        .animate-fade-in-down {
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

      <div className="absolute top-20 left-20 w-32 h-32 border border-white border-opacity-10 rounded-full" style={{ animation: 'rotate 20s linear infinite' }} />
      <div className="absolute bottom-20 right-20 w-24 h-24 border border-white border-opacity-10 rounded-lg" style={{ animation: 'float 4s ease-in-out infinite' }} />
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-white bg-opacity-5 rounded-full" style={{ animation: 'pulse 3s ease-in-out infinite' }} />
      <div className="absolute bottom-1/3 left-1/4 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 opacity-10 rounded-full" style={{ animation: 'pulse 4s ease-in-out infinite' }} />
    </div>
  );
};