import React, { useState, useEffect } from 'react';
import { CreditCard, Search, ExternalLink, Calendar, DollarSign } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Payment } from '../../types';
import { paymentsApi } from '../../services/api';

export const PaymentsModule: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await paymentsApi.getAll();
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.dniUsuario.includes(searchTerm)
  );

  const getStatusBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Completado': return 'success';
      case 'Pendiente': return 'warning';
      case 'Cancelado': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
        <p className="text-gray-600">Gestiona los pagos del sistema</p>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Buscar por DNI de usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4 text-gray-400" />}
        />
      </Card>

      {/* Payments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPayments.map((payment) => (
          <Card key={payment.id} className="hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Pago #{payment.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      DNI: {payment.dniUsuario}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(payment.estado || 'Pendiente')}>
                  {payment.estado || 'Pendiente'}
                </Badge>
              </div>

              <div className="space-y-3">
                {payment.monto && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Monto
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      ${payment.monto.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(payment.fecha).toLocaleDateString()} {new Date(payment.fecha).toLocaleTimeString()}
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => window.open(payment.enlace, '_blank')}
                    className="w-full"
                  >
                    Ver Enlace de Pago
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredPayments.length === 0 && (
        <Card className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron pagos
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Intenta ajustar los términos de búsqueda' : 'No hay pagos registrados'}
          </p>
        </Card>
      )}
    </div>
  );
};