import React, { useState } from 'react';
import { LogIn, User, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { authApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState({ dni: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Conferencias</h1>
          <p className="text-gray-600 mt-2">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="DNI"
            type="text"
            value={credentials.dni}
            onChange={(e) => setCredentials(prev => ({ ...prev, dni: e.target.value }))}
            placeholder="Ingresa tu DNI"
            icon={<User className="w-5 h-5 text-gray-400" />}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Ingresa tu contraseña"
            icon={<Lock className="w-5 h-5 text-gray-400" />}
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            Iniciar Sesión
          </Button>
        </form>

        <div className="mt-6 text-center">
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-xs text-gray-600 mb-2">Datos de prueba:</p>
            <p className="text-xs"><strong>Admin:</strong> DNI: 12345678, Pass: admin123</p>
            <p className="text-xs"><strong>Encargado:</strong> DNI: 55667788, Pass: admin123</p>
          </div>
        </div>
      </Card>
    </div>
  );
};