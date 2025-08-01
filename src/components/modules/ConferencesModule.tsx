import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Search, MapPin, Users, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Conference, Region, ConferenceRequest } from '../../types';
import { conferencesApi, regionsApi } from '../../services/api';
import { formatDateForInput, formatDateForDisplay } from '../../utils/dateUtils';

export const ConferencesModule: React.FC = () => {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [conferenceToDelete, setConferenceToDelete] = useState<Conference | null>(null);
  const [editingConference, setEditingConference] = useState<Conference | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ConferenceRequest>({
    nombres: '',
    idRegion: '',
    fechaInicio: '',
    fechaFin: '',
    fechaFinIns: '',
    capacidad: 50
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError('');
      const [conferencesData, regionsData] = await Promise.all([
        conferencesApi.getAll(),
        regionsApi.getAll()
      ]);
      setConferences(conferencesData);
      setRegions(regionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredConferences = conferences.filter(conference => {
    const matchesSearch = conference.nombres.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !selectedRegion || conference.idRegion === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      if (editingConference) {
        await conferencesApi.update(editingConference.id, formData);
      } else {
        await conferencesApi.create(formData);
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving conference:', error);
      setError('Error al guardar la conferencia. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (conference: Conference) => {
    setConferenceToDelete(conference);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!conferenceToDelete) return;
    
    setDeleting(true);
    setError('');
    
    try {
      await conferencesApi.delete(conferenceToDelete.id);
      await loadData();
      setIsDeleteDialogOpen(false);
      setConferenceToDelete(null);
    } catch (error) {
      console.error('Error deleting conference:', error);
      setError('Error al eliminar la conferencia. Por favor, intenta nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (conference: Conference) => {
    setEditingConference(conference);
    setFormData({
      nombres: conference.nombres,
      idRegion: conference.idRegion,
      fechaInicio: formatDateForInput(conference.fechaInicio),
      fechaFin: formatDateForInput(conference.fechaFin),
      fechaFinIns: formatDateForInput(conference.fechaFinIns),
      capacidad: conference.capacidad
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingConference(null);
    setError('');
    setFormData({
      nombres: '',
      idRegion: '',
      fechaInicio: '',
      fechaFin: '',
      fechaFinIns: '',
      capacidad: 50
    });
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conferencias</h1>
          <p className="text-gray-600">Gestiona las conferencias del sistema</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
          Nueva Conferencia
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar conferencias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
            >
              <option value="">Todas las regiones</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>
                  {region.nombres}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Conferences Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredConferences.map(conference => (
          <Card key={conference.id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 line-clamp-2 pr-2">
                  {conference.nombres}
                </h3>
                <div className="flex space-x-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit}
                    onClick={() => handleEdit(conference)}
                    className="text-blue-600 hover:text-blue-700"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(conference)}
                    className="text-red-600 hover:text-red-700"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{conference.nombreRegion}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>
                    {formatDateForDisplay(conference.fechaInicio)} - {formatDateForDisplay(conference.fechaFin)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{conference.participantesInscritos}/{conference.capacidad} participantes</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Badge variant={!conference.estaVigente ? 'secondary' : conference.participantesInscritos >= conference.capacidad ? 'danger' : 'success'}>
                  {!conference.estaVigente ? 'No Vigente' : conference.participantesInscritos >= conference.capacidad ? 'Completa' : 'Disponible'}
                </Badge>
                <span className="text-xs text-gray-500">
                  Hasta: {formatDateForDisplay(conference.fechaFinIns)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredConferences.length === 0 && !loading && (
        <Card className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron conferencias
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedRegion ? 'Intenta ajustar los filtros de búsqueda' : 'Comienza creando una nueva conferencia'}
          </p>
        </Card>
      )}

      {/* Conference Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingConference ? 'Editar Conferencia' : 'Nueva Conferencia'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Input
            label="Nombre de la conferencia"
            value={formData.nombres}
            onChange={(e) => setFormData(prev => ({ ...prev, nombres: e.target.value }))}
            placeholder="Ej: Conferencia de Tecnología 2025"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Región <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.idRegion}
              onChange={(e) => setFormData(prev => ({ ...prev, idRegion: e.target.value }))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
              required
            >
              <option value="">Seleccionar región</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>
                  {region.nombres}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Fecha de inicio"
              type="date"
              value={formData.fechaInicio}
              onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
              required
            />
            <Input
              label="Fecha de fin"
              type="date"
              value={formData.fechaFin}
              onChange={(e) => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
              required
            />
            <Input
              label="Fin de inscripción"
              type="date"
              value={formData.fechaFinIns}
              onChange={(e) => setFormData(prev => ({ ...prev, fechaFinIns: e.target.value }))}
              required
            />
          </div>

          <Input
            label="Capacidad máxima"
            type="number"
            min="1"
            max="1000"
            value={formData.capacidad}
            onChange={(e) => setFormData(prev => ({ ...prev, capacidad: parseInt(e.target.value) || 1 }))}
            placeholder="Número máximo de participantes"
            required
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleCloseModal}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              loading={submitting}
              disabled={submitting}
            >
              {editingConference ? 'Actualizar' : 'Crear'} Conferencia
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Conferencia"
        message={`¿Estás seguro de que deseas eliminar la conferencia "${conferenceToDelete?.nombres}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
};