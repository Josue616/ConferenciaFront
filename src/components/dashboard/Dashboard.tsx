import React from 'react';
import { DashboardStats } from './DashboardStats';
import { RecentActivity } from './RecentActivity';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { Heart, Calendar, Users } from 'lucide-react';

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