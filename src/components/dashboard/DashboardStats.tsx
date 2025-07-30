import React from 'react';
import { Calendar, Users, UserCheck, CreditCard } from 'lucide-react';
import { Card } from '../ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, description }) => (
  <Card className="relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-10 rounded-full -mr-10 -mt-10`} />
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        {icon}
      </div>
    </div>
  </Card>
);

export const DashboardStats: React.FC = () => {
  const stats = [
    {
      title: 'Total Conferencias',
      value: 3,
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-600',
      description: 'Conferencias programadas'
    },
    {
      title: 'Usuarios Registrados',
      value: 4,
      icon: <Users className="w-6 h-6 text-green-600" />,
      color: 'bg-green-600',
      description: 'Usuarios en el sistema'
    },
    {
      title: 'Participaciones',
      value: 3,
      icon: <UserCheck className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-600',
      description: 'Inscripciones activas'
    },
    {
      title: 'Pagos Procesados',
      value: 3,
      icon: <CreditCard className="w-6 h-6 text-orange-600" />,
      color: 'bg-orange-600',
      description: 'Transacciones registradas'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};