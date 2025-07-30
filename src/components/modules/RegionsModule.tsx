import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Region } from '../../types';
import { regionsApi } from '../../services/api';

export const RegionsModule: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [regionName, setRegionName] = useState('');

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const data = await regionsApi.getAll();
      setRegions(data);
    } catch (error) {
      console.error('Error loading regions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegions = regions.filter(region =>
    region.nombres.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRegion) {
        // Update region logic would go here
        console.log('Update region:', { id: editingRegion.id, nombres: regionName });
      } else {
        // Create region logic would go here
        console.log('Create region:', { nombres: regionName });
      }
      handleCloseModal();
      // In a real app, refresh the data here
    } catch (error) {
      console.error('Error saving region:', error);
    }
  };

  const handleEdit = (region: Region) => {
    setEditingRegion(region);
    setRegionName(region.nombres);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta región?')) {
      // Delete region logic would go here
      console.log('Delete region:', id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRegion(null);
    setRegionName('');
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
          <p className="text-gray-600">Gestiona las regiones del sistema</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
          Nueva Región
        </Button>
      </div>

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
        {filteredRegions.map(region => (
          <Card key={region.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {region.nombres}
                  </h3>
                  <p className="text-sm text-gray-600">
                    ID: {region.id.slice(-8)}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Edit}
                  onClick={() => handleEdit(region)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => handleDelete(region.id)}
                  className="text-red-600 hover:text-red-700"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredRegions.length === 0 && (
        <Card className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron regiones
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Intenta ajustar los términos de búsqueda' : 'Comienza creando una nueva región'}
          </p>
        </Card>
      )}

      {/* Region Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingRegion ? 'Editar Región' : 'Nueva Región'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nombre de la región"
            value={regionName}
            onChange={(e) => setRegionName(e.target.value)}
            placeholder="Ej: Lima, Arequipa, Cusco..."
            required
          />

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingRegion ? 'Actualizar' : 'Crear'} Región
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};