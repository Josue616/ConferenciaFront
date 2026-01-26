import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Search, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Pagination } from '../ui/Pagination';
import { Region } from '../../types';
import { regionsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ITEMS_PER_PAGE = 12;

export const RegionsModule: React.FC = () => {
  const { isAdmin } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<Region | null>(null);
  const [regionName, setRegionName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      setError('');
      const data = await regionsApi.getAll();
      setRegions(data);
    } catch (error) {
      console.error('Error loading regions:', error);
      setError('Error al cargar las regiones. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const filteredRegions = regions.filter(region =>
    region.nombres.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredRegions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRegions = filteredRegions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionName.trim()) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      await regionsApi.create(regionName.trim());
      await loadRegions();
      handleCloseModal();
    } catch (error) {
      console.error('Error creating region:', error);
      setError('Error al crear la región. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (region: Region) => {
    setRegionToDelete(region);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!regionToDelete) return;
    
    setDeleting(true);
    setError('');
    
    try {
      await regionsApi.delete(regionToDelete.id);
      await loadRegions();
      setIsDeleteDialogOpen(false);
      setRegionToDelete(null);
    } catch (error) {
      console.error('Error deleting region:', error);
      setError('Error al eliminar la región. Por favor, intenta nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRegionName('');
    setError('');
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
          <h1 className="text-2xl font-bold text-gray-900">Regiones</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Gestiona las regiones del sistema' : 'Consulta las regiones disponibles'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
            Nueva Región
          </Button>
        )}
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

      {/* Search */}
      <Card>
        <Input
          placeholder="Buscar regiones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4 text-gray-400" />}
        />
      </Card>

      {/* Regions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedRegions.map(region => (
          <Card key={region.id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {region.nombres}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    ID: {region.id.slice(-8)}
                  </p>
                </div>
              </div>
              {isAdmin && (
                <div className="flex space-x-1 flex-shrink-0 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(region)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card padding="sm">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredRegions.length}
          />
        </Card>
      )}

      {filteredRegions.length === 0 && !loading && (
        <Card className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron regiones
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Intenta ajustar los términos de búsqueda' : 'No hay regiones registradas'}
          </p>
        </Card>
      )}

      {/* Region Modal - Solo para Admin */}
      {isAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Nueva Región"
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Input
              label="Nombre de la región"
              value={regionName}
              onChange={(e) => setRegionName(e.target.value)}
              placeholder="Ej: Lima, Arequipa, Cusco..."
              required
              autoFocus
            />

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
                disabled={submitting || !regionName.trim()}
                icon={Plus}
                className="w-full sm:w-auto"
              >
                Crear Región
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog - Solo para Admin */}
      {isAdmin && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Eliminar Región"
          message={`¿Estás seguro de que deseas eliminar la región "${regionToDelete?.nombres}"? Esta acción no se puede deshacer y puede afectar a las conferencias asociadas.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
          loading={deleting}
        />
      )}
    </div>
  );
};