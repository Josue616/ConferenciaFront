import React from 'react';
import { DashboardStats } from './DashboardStats';
import { RecentActivity } from './RecentActivity';
import { useAuth } from '../../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.nombres}
        </h1>
        <p className="text-gray-600 mt-2">
          Aquí tienes un resumen de la actividad del sistema de conferencias
        </p>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm font-medium text-gray-900">Nueva Conferencia</div>
                <div className="text-xs text-gray-600">Crear una nueva conferencia</div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm font-medium text-gray-900">Ver Reportes</div>
                <div className="text-xs text-gray-600">Generar reportes del sistema</div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm font-medium text-gray-900">Gestionar Usuarios</div>
                <div className="text-xs text-gray-600">Administrar usuarios del sistema</div>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Servidor</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Activo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base de Datos</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Conectada
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sincronización</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Actualizada
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};