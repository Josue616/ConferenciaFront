import React, { useState, useEffect } from 'react';
import { Calendar, Users, UserCheck, CreditCard, TrendingUp, MapPin } from 'lucide-react';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { reportsApi, conferencesApi } from '../../services/api';
import { UsersTotalReport, ParticipantsReport } from '../../types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description?: string;
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  description, 
  loading = false,
  trend 
}) => (
  <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
    <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-10 rounded-full -mr-10 -mt-10`} />
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="flex items-center space-x-2 mt-1">
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
          {trend && !loading && (
            <div className={`flex items-center text-xs font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10 flex-shrink-0`}>
        {icon}
      </div>
    </div>
  </Card>
);

export const DashboardStats: React.FC = () => {
  const [usersReport, setUsersReport] = useState<UsersTotalReport | null>(null);
  const [participantsReport, setParticipantsReport] = useState<ParticipantsReport | null>(null);
  const [conferencesCount, setConferencesCount] = useState<number>(0);
  const [paymentsData, setPaymentsData] = useState<{ total: number; withPayment: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError('');
      
      // Load all reports in parallel
      const [
        usersData,
        participantsData,
        conferencesData,
        participationsWithPayments
      ] = await Promise.all([
        reportsApi.getUsersTotal(),
        reportsApi.getParticipantsReport(),
        conferencesApi.getAll(),
        reportsApi.getParticipationsWithPayments()
      ]);

      setUsersReport(usersData);
      setParticipantsReport(participantsData);
      setConferencesCount(conferencesData.length);
      
      // Calculate payments statistics
      const totalParticipations = participationsWithPayments.length;
      const withPayment = participationsWithPayments.filter(p => p.tienePago).length;
      setPaymentsData({ total: totalParticipations, withPayment });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Conferencias',
      value: loading ? 0 : conferencesCount,
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-600',
      description: 'Conferencias programadas',
      loading
    },
    {
      title: 'Usuarios Registrados',
      value: loading ? 0 : (usersReport?.totalGeneral || 0),
      icon: <Users className="w-6 h-6 text-green-600" />,
      color: 'bg-green-600',
      description: 'Usuarios en el sistema',
      loading
    },
    {
      title: 'Participantes Únicos',
      value: loading ? 0 : (participantsReport?.totalParticipantesUnicos || 0),
      icon: <UserCheck className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-600',
      description: 'Personas participando',
      loading
    },
    {
      title: 'Pagos Completados',
      value: loading ? 0 : (paymentsData?.withPayment || 0),
      icon: <CreditCard className="w-6 h-6 text-orange-600" />,
      color: 'bg-orange-600',
      description: `de ${paymentsData?.total || 0} participaciones`,
      loading
    }
  ];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Regional Breakdown */}
      {usersReport && usersReport.porRegion.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Usuarios por Región</h3>
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usersReport.porRegion.map((region) => (
              <div key={region.idRegion} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{region.nombreRegion}</h4>
                    <p className="text-sm text-gray-600">Región</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{region.cantidadUsuarios}</p>
                    <p className="text-xs text-gray-500">usuarios</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Participation Summary */}
      {participantsReport && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Resumen de Participaciones</h3>
            <UserCheck className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Participantes Únicos</h4>
                  <p className="text-sm text-gray-600">Personas diferentes</p>
                </div>
                <p className="text-3xl font-bold text-green-600">{participantsReport.totalParticipantesUnicos}</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Total Participaciones</h4>
                  <p className="text-sm text-gray-600">Inscripciones totales</p>
                </div>
                <p className="text-3xl font-bold text-purple-600">{participantsReport.totalParticipaciones}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Status */}
      {paymentsData && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Estado de Pagos</h3>
            <CreditCard className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{paymentsData.total}</p>
                <p className="text-sm text-gray-600">Total Participaciones</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{paymentsData.withPayment}</p>
                <p className="text-sm text-gray-600">Con Pago</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{paymentsData.total - paymentsData.withPayment}</p>
                <p className="text-sm text-gray-600">Sin Pago</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso de Pagos</span>
              <span>{Math.round((paymentsData.withPayment / paymentsData.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(paymentsData.withPayment / paymentsData.total) * 100}%` }}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};