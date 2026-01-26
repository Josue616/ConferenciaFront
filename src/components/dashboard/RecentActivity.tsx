import React, { useState, useEffect } from 'react';
import { UserPlus, CreditCard, Clock, MapPin, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { reportsApi } from '../../services/api';
import { ParticipationWithPayment, ParticipantsByRegionReport } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const RecentActivity: React.FC = () => {
  const { isAdmin } = useAuth();
  const [recentParticipations, setRecentParticipations] = useState<ParticipationWithPayment[]>([]);
  const [regionStats, setRegionStats] = useState<ParticipantsByRegionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadActivityData();
  }, []);

  const loadActivityData = async () => {
    try {
      setError('');
      
      // Load data with individual error handling
      let participationsData = [];
      let regionsData = [];

      try {
        participationsData = await reportsApi.getParticipationsWithPayments();
      } catch (error) {
        console.warn('Error loading participations with payments:', error);
      }

      try {
        regionsData = await reportsApi.getParticipantsByRegion();
      } catch (error) {
        console.warn('Error loading participants by region:', error);
      }

      // Sort by date and take the most recent 5
      const sortedParticipations = participationsData
        .sort((a, b) => new Date(b.fechaParticipacion).getTime() - new Date(a.fechaParticipacion).getTime())
        .slice(0, 5);
      
      setRecentParticipations(sortedParticipations);
      setRegionStats(regionsData);

    } catch (error) {
      console.error('Error loading activity data:', error);
      setError('Error al cargar algunos datos de actividad. Algunos reportes pueden no estar disponibles.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  };

  const getActivityIcon = (participation: ParticipationWithPayment) => {
    if (participation.tienePago) {
      return <CreditCard className="w-4 h-4" />;
    }
    return <UserPlus className="w-4 h-4" />;
  };

  const getActivityColor = (participation: ParticipationWithPayment) => {
    if (participation.tienePago) {
      return 'text-green-600 bg-green-100';
    }
    return 'text-blue-600 bg-blue-100';
  };

  const getActivityTitle = (participation: ParticipationWithPayment) => {
    if (participation.tienePago) {
      return 'Pago completado';
    }
    return 'Nueva participación';
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={loadActivityData} 
            variant="secondary" 
            className="mt-4"
          >
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        
        {recentParticipations.length > 0 ? (
          <div className="space-y-4">
            {recentParticipations.map((participation) => (
              <div key={participation.idParticipacion} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getActivityColor(participation)}`}>
                  {getActivityIcon(participation)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {getActivityTitle(participation)}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {participation.nombreUsuario} - {participation.nombreConferencia}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{participation.regionConferencia}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(participation.fechaParticipacion)}
                    </span>
                  </div>
                </div>
                {participation.tienePago && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Pagado
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay actividad reciente</p>
          </div>
        )}
      </Card>

      {/* Regional Performance */}
      {isAdmin && regionStats.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Rendimiento por Región</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {regionStats.map((region) => (
              <div key={region.idRegion} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{region.nombreRegion}</h4>
                    <p className="text-sm text-gray-600">
                      {region.totalParticipantesUnicos} participantes únicos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{region.totalParticipaciones}</p>
                  <p className="text-xs text-gray-500">participaciones</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
};