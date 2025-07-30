import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Calendar, MapPin, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Participation } from '../../types';
import { participationsApi } from '../../services/api';

export const ParticipationsModule: React.FC = () => {
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadParticipations();
  }, []);

  const loadParticipations = async () => {
    try {
      const data = await participationsApi.getAll();
      setParticipations(data);
    } catch (error) {
      console.error('Error loading participations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipations = participations.filter(participation =>
    participation.usuario.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participation.conferencia.nombres.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Participaciones</h1>
        <p className="text-gray-600">Gestiona las participaciones en conferencias</p>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Buscar por usuario o conferencia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4 text-gray-400" />}
        />
      </Card>

      {/* Participations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredParticipations.map((participation, index) => (
          <Card key={`${participation.dniUsuario}-${participation.idConferencia}-${index}`} className="hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {participation.usuario.nombres}
                    </h3>
                    <p className="text-sm text-gray-600">
                      DNI: {participation.usuario.dni}
                    </p>
                  </div>
                </div>
                <Badge variant="success">
                  Inscrito
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Conferencia</h4>
                  <p className="text-sm text-gray-700">{participation.conferencia.nombres}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {participation.conferencia.nombreRegion}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {participation.usuario.rol}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Inscrito: {new Date(participation.fecha).toLocaleDateString()}
                  </div>
                  <div className="text-gray-500">
                    {new Date(participation.conferencia.fechaInicio).toLocaleDateString()} - {new Date(participation.conferencia.fechaFin).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredParticipations.length === 0 && (
        <Card className="text-center py-12">
          <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron participaciones
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Intenta ajustar los términos de búsqueda' : 'No hay participaciones registradas'}
          </p>
        </Card>
      )}
    </div>
  );
};