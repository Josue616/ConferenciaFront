import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Trash2, Filter, X, DollarSign, Coins, Euro, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Pagination } from '../ui/Pagination';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Gasto, GastoRequest, TotalesGastosDto } from '../../types';
import { gastosApi } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';

const CATEGORIAS = [
  'Marketing',
  'Infraestructura',
  'Personal',
  'Servicios',
  'Equipamiento',
  'Consultoria',
  'Legal',
  'Otros'
];

export const GastosModule: React.FC = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [gastoToDelete, setGastoToDelete] = useState<Gasto | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Totales del endpoint
  const [totales, setTotales] = useState<TotalesGastosDto | null>(null);
  
  // Filtros
  const [filterMes, setFilterMes] = useState<number | ''>('');
  const [filterAnio, setFilterAnio] = useState<number | ''>('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState<GastoRequest>({
    monto: 0,
    currency: 1, // Default: Soles
    categoria: '',
    descripcion: ''
  });

  useEffect(() => {
    loadGastos();
    loadTotales();
  }, [filterMes, filterAnio, filterCategoria]);

  const loadGastos = async () => {
    try {
      setError('');
      const mes = filterMes !== '' ? Number(filterMes) : undefined;
      const anio = filterAnio !== '' ? Number(filterAnio) : undefined;
      const categoria = filterCategoria || undefined;
      
      const data = await gastosApi.getAll(mes, anio, categoria);
      setGastos(data);
    } catch (error) {
      setError('Error al cargar los gastos');
      console.error('Error loading gastos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTotales = async () => {
    try {
      const filtros: any = {};
      
      if (filterCategoria) {
        filtros.categoria = filterCategoria;
      }
      
      const data = await gastosApi.getTotales(filtros);
      setTotales(data);
    } catch (error) {
      console.error('Error loading totales:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await gastosApi.create(formData);
      setSuccessMessage('Gasto registrado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadGastos();
      await loadTotales();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      setError('Error al registrar el gasto');
      console.error('Error creating gasto:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!gastoToDelete) return;
    
    try {
      setError('');
      await gastosApi.delete(gastoToDelete.id);
      setSuccessMessage('Gasto eliminado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadGastos();
      await loadTotales();
      setIsDeleteDialogOpen(false);
      setGastoToDelete(null);
    } catch (error) {
      setError('Error al eliminar el gasto');
      console.error('Error deleting gasto:', error);
    }
  };

  const resetForm = () => {
    setFormData({ monto: 0, currency: 1, categoria: '', descripcion: '' });
  };

  const openDeleteDialog = (gasto: Gasto) => {
    setGastoToDelete(gasto);
    setIsDeleteDialogOpen(true);
  };

  const clearFilters = () => {
    setFilterMes('');
    setFilterAnio('');
    setFilterCategoria('');
  };

  const getCurrencyIcon = (currency: number | string) => {
    // Si es string, convertir a número
    let currencyNum: number;
    if (typeof currency === 'string') {
      const currencyMap: Record<string, number> = {
        'Dolares': 0,
        'Dólares': 0,
        'Soles': 1,
        'Euros': 2
      };
      currencyNum = currencyMap[currency] ?? 0;
    } else {
      currencyNum = currency;
    }
    
    switch (currencyNum) {
      case 0: return <DollarSign className="w-4 h-4 text-green-600" />;
      case 1: return <Coins className="w-4 h-4 text-blue-600" />;
      case 2: return <Euro className="w-4 h-4 text-yellow-600" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getCurrencyName = (currency: number | string): string => {
    if (typeof currency === 'string') {
      return currency; // Ya viene como string del API
    }
    switch (currency) {
      case 0: return 'Dólares';
      case 1: return 'Soles';
      case 2: return 'Euros';
      default: return 'Desconocido';
    }
  };

  const getCategoryColor = (categoria: string): 'secondary' | 'primary' | 'success' | 'warning' | 'danger' => {
    const colorMap: Record<string, 'secondary' | 'primary' | 'success' | 'warning' | 'danger'> = {
      'Marketing': 'primary',
      'Infraestructura': 'primary',
      'Personal': 'success',
      'Servicios': 'warning',
      'Equipamiento': 'secondary',
      'Consultoria': 'primary',
      'Legal': 'danger',
      'Otros': 'secondary'
    };
    return colorMap[categoria] || 'secondary';
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGastos = gastos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(gastos.length / itemsPerPage);

  // Totales
  const totalSoles = totales?.totalSoles || 0;
  const totalDolares = totales?.totalDolares || 0;
  const totalEuros = totales?.totalEuros || 0;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Gastos</h1>
          <p className="text-gray-600 mt-1">Registro y seguimiento de gastos operacionales</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Registrar Gasto
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Totales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total en Soles</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">S/ {totalSoles.toFixed(2)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Coins className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total en Dólares</p>
              <p className="text-2xl font-bold text-green-600 mt-1">$ {totalDolares.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total en Euros</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">€ {totalEuros.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Euro className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-700">Filtros</span>
          </div>
          <div className="flex gap-2">
            {(filterMes !== '' || filterAnio !== '' || filterCategoria) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
              <select
                value={filterMes}
                onChange={(e) => setFilterMes(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                  <option key={mes} value={mes}>
                    {new Date(2000, mes - 1).toLocaleString('es-ES', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <Input
                type="number"
                placeholder="2026"
                value={filterAnio}
                onChange={(e) => setFilterAnio(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {CATEGORIAS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moneda
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentGastos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron gastos
                  </td>
                </tr>
              ) : (
                currentGastos.map((gasto) => (
                  <tr key={gasto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(gasto.fecha)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge variant={getCategoryColor(gasto.categoria)}>
                        {gasto.categoria}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {gasto.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {gasto.monto.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {getCurrencyIcon(gasto.currency)}
                        <span>{getCurrencyName(gasto.currency)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(gasto)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={gastos.length}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modal para crear gasto */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Gasto"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.monto}
                onChange={(e) => setFormData(prev => ({ ...prev, monto: parseFloat(e.target.value) || 0 }))}
                required
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={1}>Soles</option>
                <option value={0}>Dólares</option>
                <option value={2}>Euros</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar categoría</option>
              {CATEGORIAS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              required
              placeholder="Detalle del gasto..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? <LoadingSpinner size="sm" /> : <Receipt className="w-4 h-4 mr-2" />}
              Registrar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dialog de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Gasto"
        message={`¿Estás seguro de eliminar este gasto de ${gastoToDelete ? getCurrencyName(gastoToDelete.currency) : ''} ${gastoToDelete?.monto.toFixed(2)}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};
