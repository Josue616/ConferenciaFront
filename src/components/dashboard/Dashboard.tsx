import React from 'react';
import { DashboardStats } from './DashboardStats';
import { RecentActivity } from './RecentActivity';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { Heart, Calendar, Users, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              Bienvenido, {user?.nombres}
            </h1>
            <p className="text-blue-700 mt-2 text-lg">
              Panel de control del sistema RNDC - Reunidos en Cristo
            </p>
            <div className="flex items-center space-x-4 mt-3 text-sm text-blue-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Rol: {user?.rol}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>Región: {user?.nombreRegion}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <DashboardStats />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {user?.rol === 'Admin' && (
                <button className="w-full text-left px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all duration-200 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Nueva Conferencia</div>
                      <div className="text-xs text-gray-600">Crear una nueva conferencia</div>
                    </div>
                  </div>
                </button>
              )}
              <button className="w-full text-left px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-200 border border-green-200">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Gestionar Usuarios</div>
                    <div className="text-xs text-gray-600">Administrar usuarios del sistema</div>
                  </div>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-200">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Ver Reportes</div>
                    <div className="text-xs text-gray-600">Analizar datos del sistema</div>
                  </div>
                </div>
              </button>
            </div>
          </Card>

          {/* System Status */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Servidor</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800">
                  Activo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base de Datos</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800">
                  Conectada
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Reportes</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                  Operativa
                </span>
              </div>
            </div>
          </Card>

          {/* Inspirational Quote */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="text-center">
              <Heart className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <blockquote className="text-sm text-blue-800 italic mb-2">
                "Donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos"
              </blockquote>
              <cite className="text-xs text-blue-600 font-medium">Mateo 18:20</cite>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};