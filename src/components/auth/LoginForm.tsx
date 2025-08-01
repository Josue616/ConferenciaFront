import React, { useState, useMemo } from 'react';
import { LogIn, User, Lock, Eye, EyeOff, Heart, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { authApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// CSS Animations - movido fuera del componente para evitar regeneración
const animationStyles = `
  @keyframes floatContinuous {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-15px) rotate(120deg); }
    66% { transform: translateY(-8px) rotate(240deg); }
  }
  
  @keyframes rotateContinuous {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes pulseContinuous {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.1); }
  }
  
  @keyframes slideInDown {
    0% { opacity: 0; transform: translateY(-30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideInUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .float-particle {
    animation: floatContinuous 6s ease-in-out infinite;
  }
  
  .rotate-shape {
    animation: rotateContinuous 20s linear infinite;
  }
  
  .pulse-glow {
    animation: pulseContinuous 3s ease-in-out infinite;
  }
  
  .slide-down {
    animation: slideInDown 0.8s ease-out forwards;
  }
  
  .slide-up {
    animation: slideInUp 0.8s ease-out 0.3s forwards;
    opacity: 0;
  }
  
  .shake-error {
    animation: shake 0.6s ease-in-out;
  }
  
  .gradient-bg {
    background: linear-gradient(-45deg, #1e3a8a, #3730a3, #6366f1, #8b5cf6);
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
  }
  
  .glass-effect {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .input-glow:focus {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
  }
`;

export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState({ dni: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  // Generar posiciones de partículas solo una vez usando useMemo
  const particles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 6,
    }));
  }, []);

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
    <>
      {/* CSS Animations - Definido una sola vez */}
      <style>{animationStyles}</style>

      <div className="min-h-screen relative overflow-hidden gradient-bg">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Particles - Posiciones fijas usando useMemo */}
          {particles.map((particle) => (
            <div
              key={`particle-${particle.id}`}
              className="absolute w-2 h-2 bg-white rounded-full float-particle pulse-glow"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
          
          {/* Geometric Shapes */}
          <div 
            className="absolute top-20 left-20 w-32 h-32 border-2 border-white border-opacity-20 rounded-full rotate-shape"
          />
          <div 
            className="absolute bottom-32 right-16 w-24 h-24 border-2 border-white border-opacity-15 rounded-lg rotate-shape"
            style={{ animationDuration: '25s', animationDirection: 'reverse' }}
          />
          <div 
            className="absolute top-1/2 left-16 w-16 h-16 bg-white bg-opacity-10 rounded-full pulse-glow"
            style={{ animationDelay: '2s' }}
          />
          <div 
            className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 rounded-full pulse-glow"
            style={{ animationDelay: '4s', animationDuration: '4s' }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Logo and Title */}
            <div className="text-center mb-8 slide-down">
              {/* Logo */}
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full pulse-glow shadow-2xl" />
                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-xl">
                  <Heart className="w-8 h-8 text-red-500 pulse-glow" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
                <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                  RNDC
                </span>
              </h1>
              <p className="text-blue-200 text-lg font-medium mb-1">
                Reunidos en Cristo
              </p>
              <p className="text-blue-300 text-sm opacity-90">
                Sistema de Gestión de Conferencias
              </p>
            </div>

            {/* Login Form */}
            <div className="slide-up">
              <div className="glass-effect rounded-2xl shadow-2xl p-8">
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
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-blue-300" />
                      </div>
                      <input
                        type="text"
                        value={credentials.dni}
                        onChange={(e) => setCredentials(prev => ({ ...prev, dni: e.target.value }))}
                        placeholder="Ingresa tu DNI"
                        className="block w-full pl-12 pr-4 py-3 glass-effect rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 input-glow"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-blue-100">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-blue-300" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Ingresa tu contraseña"
                        className="block w-full pl-12 pr-12 py-3 glass-effect rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 input-glow"
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
                    <div className="glass-effect border border-red-400 border-opacity-30 rounded-xl p-4 shake-error">
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
                      <div className="absolute inset-0 bg-white bg-opacity-20 flex items-center justify-center">
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
                  <p className="text-blue-300 text-xs opacity-75">
                    "Donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
