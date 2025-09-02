import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Calendar, MapPin, Users, Plus, Filter, AlertCircle, UserIcon, Calendar as CalendarIcon, Trash2, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Pagination } from '../ui/Pagination';
import { Participation, ParticipationRequest, Conference, Region, User } from '../../types';
import { participationsApi, conferencesApi, regionsApi, csvExportApi } from '../../services/api';
import { UserSearchSelect } from '../ui/UserSearchSelect';

const ITEMS_PER_PAGE = 10;

export const ParticipationsModule: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'Admin';
  
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConference, setSelectedConference] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [participationToDelete, setParticipationToDelete] = useState<Participation | null>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ParticipationRequest>({
    dniUsuario: '',
    idConferencia: '',
    servicio: 'Participante'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError('');
      
      // Load data sequentially to better handle potential errors
      const participationsData = await participationsApi.getAll();
      setParticipations(participationsData);
      
      const conferencesData = await conferencesApi.getAll();
      setConferences(conferencesData);
      
      const regionsData = await regionsApi.getAll();
      setRegions(regionsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      if (error instanceof Error) {
        setError(`Error al cargar los datos: ${error.message}`);
      } else {
        setError('Error al cargar los datos. Verifica la conexión con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const filteredParticipations = participations.filter(participation => {
    const matchesSearch = participation.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participation.nombreConferencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participation.dniUsuario.includes(searchTerm);
    
    const matchesConference = !selectedConference || participation.idConferencia === selectedConference;
    
    // Para Admins: filtrar por región si está seleccionada
    // Para Encargados: la API ya filtra por región, no aplicar filtro adicional
    let matchesRegion = true;
    if (isAdmin && selectedRegion) {
      const conference = conferences.find(c => c.id === participation.idConferencia);
      matchesRegion = conference ? conference.idRegion === selectedRegion : false;
    }
    
    return matchesSearch && matchesConference && matchesRegion;
  });

  // Paginación
  const totalPages = Math.ceil(filteredParticipations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedParticipations = filteredParticipations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedConference, selectedRegion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      await participationsApi.create(formData);
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error creating participation:', error);
      setError('Error al crear la participación. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (participation: Participation) => {
    setParticipationToDelete(participation);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!participationToDelete) return;
    
    setDeleting(true);
    setError('');
    
    try {
      await participationsApi.delete(participationToDelete.id);
      await loadData();
      setIsDeleteDialogOpen(false);
      setParticipationToDelete(null);
    } catch (error) {
      console.error('Error deleting participation:', error);
      setError('Error al eliminar la participación. Por favor, intenta nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError('');
    setFormData({
      dniUsuario: '',
      idConferencia: '',
      servicio: 'Participante'
    });
  };

  const handleExportCSV = async () => {
    setExporting(true);
    setError('');
    
    try {
      await csvExportApi.exportParticipations();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError('Error al exportar los datos. Por favor, intenta nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  const getConferenceRegion = (conferenceId: string) => {
    const conference = conferences.find(c => c.id === conferenceId);
    return conference ? conference.nombreRegion : 'Desconocida';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
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
          <h1 className="text-2xl font-bold text-gray-900">Participaciones</h1>
          <p className="text-gray-600">Gestiona las participaciones en conferencias</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleExportCSV}
            variant="secondary"
            icon={Download}
            loading={exporting}
            disabled={exporting}
          >
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
            Nueva Participación
          </Button>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Buscar por usuario, conferencia o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>
          <div>
            <select
              value={selectedConference}
              onChange={(e) => setSelectedConference(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
            >
              <option value="">Todas las conferencias</option>
              {conferences.map(conference => (
                <option key={conference.id} value={conference.id}>
                  {conference.nombres}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
              disabled={!isAdmin}
            >
              <option value="">{isAdmin ? 'Todas las regiones' : 'Mi región'}</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>
                  {region.nombres}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Participations Table */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conferencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Inscripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedParticipations.map((participation) => (
                <tr key={participation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {participation.nombreUsuario}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {participation.dniUsuario}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {participation.nombreConferencia}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      participation.servicio === 'Participante' ? 'primary' :
                      participation.servicio === 'Musica' ? 'success' :
                      participation.servicio === 'Cocina' ? 'warning' :
                      participation.servicio === 'Infantes' ? 'secondary' : 'primary'
                    }>
                      {participation.servicio}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(participation.fecha)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="success">
                      Inscrito
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDelete(participation)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredParticipations.length}
        />
      </Card>

      {filteredParticipations.length === 0 && !loading && (
        <Card className="text-center py-12">
          <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron participaciones
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedConference || selectedRegion ? 'Intenta ajustar los filtros de búsqueda' : 'No hay participaciones registradas'}
          </p>
        </Card>
      )}

      {/* Participation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Nueva Participación"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <UserSearchSelect
            selectedUser={formData.dniUsuario}
            onUserSelect={(dni) => setFormData(prev => ({ ...prev, dniUsuario: dni }))}
            regions={regions}
            placeholder="Buscar usuario por nombre..."
            required
            disabled={submitting}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conferencia <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.idConferencia}
              onChange={(e) => setFormData(prev => ({ ...prev, idConferencia: e.target.value }))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
              required
            >
              <option value="">Seleccionar conferencia</option>
              {conferences.map(conference => (
                <option key={conference.id} value={conference.id}>
                  {conference.nombres} - {conference.nombreRegion}
                </option>
              ))}
            </select>
          </div>

          {/* Conference Info */}
          {formData.idConferencia && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              {(() => {
                const selectedConf = conferences.find(c => c.id === formData.idConferencia);
                return selectedConf ? (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-blue-800">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      <span>
                        {new Date(selectedConf.fechaInicio).toLocaleDateString()} - {new Date(selectedConf.fechaFin).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-blue-800">
                      <Users className="w-4 h-4 mr-2" />
                      <span>
                        Capacidad: {selectedConf.participantesInscritos}/{selectedConf.capacidad}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-blue-800">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{selectedConf.nombreRegion}</span>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleCloseModal}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              loading={submitting}
              disabled={submitting}
              icon={UserCheck}
              className="w-full sm:w-auto"
            >
              Crear Participación
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Participación"
        message={`¿Estás seguro de que deseas eliminar la participación de "${participationToDelete?.nombreUsuario}" en "${participationToDelete?.nombreConferencia}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
};