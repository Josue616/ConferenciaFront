import React from 'react';
import { Calendar, UserPlus, CreditCard, Clock } from 'lucide-react';
import { Card } from '../ui/Card';

interface ActivityItem {
  id: string;
  type: 'conference' | 'user' | 'payment' | 'participation';
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}

export const RecentActivity: React.FC = () => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'conference',
      title: 'Nueva conferencia creada',
      description: 'Conferencia de Tecnología Lima 2025',
      time: 'Hace 2 horas',
      icon: <Calendar className="w-4 h-4" />,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: '2',
      type: 'participation',
      title: 'Nueva participación',
      description: 'María González se inscribió en Simposio Empresarial',
      time: 'Hace 4 horas',
      icon: <UserPlus className="w-4 h-4" />,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: '3',
      type: 'payment',
      title: 'Pago completado',
      description: 'Ana Torres completó el pago de $150.00',
      time: 'Hace 6 horas',
      icon: <CreditCard className="w-4 h-4" />,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      id: '4',
      type: 'conference',
      title: 'Conferencia actualizada',
      description: 'Congreso de Innovación Cusco - Capacidad aumentada',
      time: 'Hace 1 día',
      icon: <Calendar className="w-4 h-4" />,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${activity.color}`}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.title}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Ver toda la actividad →
        </button>
      </div>
    </Card>
  );
};