import React, { useState, useEffect } from 'react';
import { Users, CreditCard, Tag, BarChart3, Plus, Edit, Search, DollarSign, Coins, Euro, MapPin, TrendingUp, TrendingDown, Filter, FileText, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Inversor, InversorRequest, PagoInversor, PagoInversorRequest, Tipo, ReporteInversorDto, ReporteGeneralDto, Region } from '../../types';
import { investorsApi, regionsApi } from '../../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const InvestorsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inversores' | 'pagos' | 'tipos' | 'reportes'>('inversores');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Módulo de Inversores</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('inversores')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inversores'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Inversores
          </button>
          <button
            onClick={() => setActiveTab('pagos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pagos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Pagos
          </button>
          <button
            onClick={() => setActiveTab('tipos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tipos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Tag className="w-4 h-4 inline mr-2" />
            Tipos
          </button>
          <button
            onClick={() => setActiveTab('reportes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reportes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Reportes
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'inversores' && <InversoresTab />}
      {activeTab === 'pagos' && <PagosTab />}
      {activeTab === 'tipos' && <TiposTab />}
      {activeTab === 'reportes' && <ReportesTab />}
    </div>
  );
};

// Inversores Tab Component
const InversoresTab: React.FC = () => {
  const [inversores, setInversores] = useState<Inversor[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInversor, setEditingInversor] = useState<Inversor | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<InversorRequest>({
    nombre: '',
    idRegion: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError('');
      const [inversoresData, regionsData] = await Promise.all([
        investorsApi.getAllInversores(),
        regionsApi.getAll()
      ]);
      setInversores(inversoresData);
      setRegions(regionsData);
    } catch (error) {
      setError('Error al cargar los datos');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingInversor) {
        // Note: API doesn't have update endpoint, so we'll recreate
        await investorsApi.createInversor(formData);
        setInversores(prev => prev.filter(inv => inv.id !== editingInversor.id));
      } else {
        await investorsApi.createInversor(formData);
      }
      await loadData();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      setError('Error al guardar el inversor');
      console.error('Error saving inversor:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', idRegion: '' });
    setEditingInversor(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (inversor: Inversor) => {
    setEditingInversor(inversor);
    setFormData({
      nombre: inversor.nombre,
      idRegion: inversor.idRegion
    });
    setIsModalOpen(true);
  };

  const filteredInversores = inversores.filter(inversor => {
    const matchesSearch = inversor.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !selectedRegion || inversor.idRegion === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Gestión de Inversores</h2>
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Inversor
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-64">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las regiones</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>{region.nombres}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Región
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInversores.map((inversor) => (
                <tr key={inversor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {inversor.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {inversor.nombreRegion || inversor.region?.nombres || 'Sin región'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(inversor)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInversor ? 'Editar Inversor' : 'Crear Inversor'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Región
            </label>
            <select
              value={formData.idRegion}
              onChange={(e) => setFormData(prev => ({ ...prev, idRegion: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar región</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>{region.nombres}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
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
              {submitting ? <LoadingSpinner size="sm" /> : null}
              {editingInversor ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Pagos Tab Component
const PagosTab: React.FC = () => {
  const [pagos, setPagos] = useState<PagoInversor[]>([]);
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [inversores, setInversores] = useState<Inversor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<PagoInversorRequest>({
    idInversor: '',
    monto: 0,
    currency: 0,
    idTipo: ''
  });
  
  // Filtros
  const [searchInversor, setSearchInversor] = useState('');
  const [filterCurrency, setFilterCurrency] = useState<number | ''>('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterFechaInicio, setFilterFechaInicio] = useState('');
  const [filterFechaFin, setFilterFechaFin] = useState('');
  
  // Boleta
  const [boletaPago, setBoletaPago] = useState<PagoInversor | null>(null);
  const [isBoletaModalOpen, setIsBoletaModalOpen] = useState(false);
  
  // Búsqueda de inversor en formulario
  const [inversorSearchTerm, setInversorSearchTerm] = useState('');
  const [inversorNombreSeleccionado, setInversorNombreSeleccionado] = useState('');
  const [showInversorDropdown, setShowInversorDropdown] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError('');
      console.log('Loading pagos data...');
      const [pagosData, tiposData, inversoresData] = await Promise.all([
        investorsApi.getAllPagosInversores(),
        investorsApi.getAllTipos(),
        investorsApi.getAllInversores()
      ]);
      console.log('Pagos data loaded:', pagosData.length, 'pagos,', tiposData.length, 'tipos,', inversoresData.length, 'inversores');
      setPagos(pagosData);
      setTipos(tiposData);
      setInversores(inversoresData);
    } catch (error) {
      setError('Error al cargar los datos');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await investorsApi.createPagoInversor(formData);
      await loadData();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      setError('Error al crear el pago');
      console.error('Error creating pago:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ idInversor: '', monto: 0, currency: 0, idTipo: '' });
    setInversorSearchTerm('');
    setInversorNombreSeleccionado('');
    setShowInversorDropdown(false);
  };

  const getCurrencyIcon = (currency: number | string) => {
    const num = typeof currency === 'string' ? parseInt(currency) : currency;
    switch (num) {
      case 0: return <DollarSign className="w-4 h-4 text-green-600" />;
      case 1: return <Coins className="w-4 h-4 text-blue-600" />;
      case 2: return <Euro className="w-4 h-4 text-yellow-600" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getCurrencyName = (currency: number | string) => {
    const num = typeof currency === 'string' ? parseInt(currency) : currency;
    switch (num) {
      case 0: return 'Dólares';
      case 1: return 'Soles';
      case 2: return 'Euros';
      default: return 'Desconocido';
    }
  };

  const getCurrencySymbol = (currency: number | string): string => {
    const num = typeof currency === 'string' ? parseInt(currency) : currency;
    switch (num) {
      case 0: return '$';
      case 1: return 'S/';
      case 2: return '€';
      default: return '';
    }
  };

  const getTipoNombre = (esMicro: boolean) => esMicro ? 'Microinversionista' : 'Inversionista';

  const getInversorNombre = (idInversor: string) => {
    const inversor = inversores.find(inv => inv.id === idInversor);
    return inversor?.nombre || 'Sin inversor';
  };

  const handleGenerarBoleta = (pago: PagoInversor) => {
    setBoletaPago(pago);
    setIsBoletaModalOpen(true);
  };

  const handleImprimirBoleta = () => {
    window.print();
  };

  const filteredInversoresForm = inversores.filter(inv => 
    inv.nombre.toLowerCase().includes(inversorSearchTerm.toLowerCase())
  );

  const handleSelectInversor = (inversor: Inversor) => {
    setFormData(prev => ({ ...prev, idInversor: inversor.id }));
    setInversorNombreSeleccionado(inversor.nombre);
    setInversorSearchTerm(inversor.nombre);
    setShowInversorDropdown(false);
  };

  const filteredPagos = pagos.filter(pago => {
    const inversorNombre = getInversorNombre(pago.idInversor).toLowerCase();
    const matchesInversor = !searchInversor || inversorNombre.includes(searchInversor.toLowerCase());
    const matchesCurrency = filterCurrency === '' || pago.currency === filterCurrency;
    const matchesTipo = !filterTipo || pago.tipo?.id === filterTipo;
    
    let matchesFechas = true;
    if (filterFechaInicio || filterFechaFin) {
      const pagoFecha = new Date(pago.fechaCreacion);
      if (filterFechaInicio) {
        const inicio = new Date(filterFechaInicio);
        matchesFechas = matchesFechas && pagoFecha >= inicio;
      }
      if (filterFechaFin) {
        const fin = new Date(filterFechaFin);
        fin.setHours(23, 59, 59, 999);
        matchesFechas = matchesFechas && pagoFecha <= fin;
      }
    }
    
    return matchesInversor && matchesCurrency && matchesTipo && matchesFechas;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Gestión de Pagos de Inversores</h2>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pago
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <h3 className="font-medium text-gray-700">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inversor</label>
            <Input
              placeholder="Buscar por nombre..."
              value={searchInversor}
              onChange={(e) => setSearchInversor(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value={0}>Dólares</option>
              <option value={1}>Soles</option>
              <option value={2}>Euros</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {tipos.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{getTipoNombre(tipo.esMicroinversionista)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <Input
              type="date"
              value={filterFechaInicio}
              onChange={(e) => setFilterFechaInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <Input
              type="date"
              value={filterFechaFin}
              onChange={(e) => setFilterFechaFin(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inversor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moneda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPagos.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getInversorNombre(pago.idInversor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pago.monto.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                    {getCurrencyIcon(pago.currency)}
                    {getCurrencyName(pago.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pago.tipo ? getTipoNombre(pago.tipo.esMicroinversionista) : 'Sin tipo'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pago.fechaCreacion).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGenerarBoleta(pago)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Generar Boleta"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Pago de Inversor"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inversor
            </label>
            <div className="relative">
              <Input
                value={inversorSearchTerm}
                onChange={(e) => {
                  setInversorSearchTerm(e.target.value);
                  setShowInversorDropdown(true);
                  if (!e.target.value) {
                    setFormData(prev => ({ ...prev, idInversor: '' }));
                    setInversorNombreSeleccionado('');
                  }
                }}
                onFocus={() => setShowInversorDropdown(true)}
                placeholder="Buscar inversor por nombre..."
                icon={<Search className="w-4 h-4" />}
                required
              />
              {showInversorDropdown && inversorSearchTerm && filteredInversoresForm.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredInversoresForm.slice(0, 10).map((inversor) => (
                    <button
                      key={inversor.id}
                      type="button"
                      onClick={() => handleSelectInversor(inversor)}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                    >
                      <div className="font-medium text-gray-900">{inversor.nombre}</div>
                      <div className="text-sm text-gray-500">{inversor.nombreRegion || inversor.region?.nombres}</div>
                    </button>
                  ))}
                </div>
              )}
              {showInversorDropdown && inversorSearchTerm && filteredInversoresForm.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-center text-gray-500">
                  No se encontraron inversores
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.monto}
              onChange={(e) => setFormData(prev => ({ ...prev, monto: parseFloat(e.target.value) }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moneda
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={0}>💵 Dólares</option>
              <option value={1}>💰 Soles</option>
              <option value={2}>💶 Euros</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={formData.idTipo}
              onChange={(e) => setFormData(prev => ({ ...prev, idTipo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar tipo</option>
              {tipos.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{getTipoNombre(tipo.esMicroinversionista)}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
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
              {submitting ? <LoadingSpinner size="sm" /> : null}
              Crear
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Boleta */}
      <Modal
        isOpen={isBoletaModalOpen}
        onClose={() => setIsBoletaModalOpen(false)}
        title="Boleta de Pago de Inversor"
      >
        {boletaPago && (
          <div id="boleta-print" className="space-y-4">
            {/* Encabezado */}
            <div className="text-center border-b-2 border-gray-300 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">BOLETA DE PAGO</h2>
              <p className="text-sm text-gray-600 mt-1">Inversión - Sistema de Conferencias</p>
            </div>

            {/* Información de la Boleta */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Código</p>
                <p className="text-lg font-bold text-blue-600 mt-1">{boletaPago.codigo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Serie</p>
                <p className="text-lg font-bold text-blue-600 mt-1">{boletaPago.serie || 'N/A'}</p>
              </div>
            </div>

            {/* Información del Inversor */}
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 border-b-2 border-gray-300 pb-2">Datos del Inversor</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700 font-medium">Nombre:</span>
                  <span className="font-semibold text-gray-900">
                    {boletaPago.nombreInversor || 
                     (boletaPago.inversor?.nombre) || 
                     getInversorNombre(boletaPago.idInversor)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700 font-medium">Tipo de Inversor:</span>
                  <span className="font-semibold text-gray-900">
                    {boletaPago.esMicroinversionista !== undefined 
                      ? getTipoNombre(boletaPago.esMicroinversionista)
                      : boletaPago.tipo?.esMicroinversionista !== undefined
                        ? getTipoNombre(boletaPago.tipo.esMicroinversionista)
                        : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Información del Pago */}
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 border-b-2 border-gray-300 pb-2">Detalles del Pago</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700 font-medium">Fecha:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(boletaPago.fechaCreacion).toLocaleString('es-PE', { 
                      dateStyle: 'long',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700 font-medium">Moneda:</span>
                  <span className="font-semibold text-gray-900 flex items-center gap-2">
                    {getCurrencyIcon(boletaPago.currency)}
                    {getCurrencyName(boletaPago.currency)}
                  </span>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-700">Monto Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {getCurrencySymbol(boletaPago.currency)} {boletaPago.monto.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie de Boleta */}
            <div className="text-center text-xs text-gray-500 border-t-2 border-gray-300 pt-4 mt-6">
              <p className="font-medium">Este documento es un comprobante de pago válido</p>
              <p className="mt-1">Generado el {new Date().toLocaleString('es-PE')}</p>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 border-t pt-4 print:hidden">
              <Button
                variant="secondary"
                onClick={() => setIsBoletaModalOpen(false)}
              >
                Cerrar
              </Button>
              <Button
                onClick={handleImprimirBoleta}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Tipos Tab Component
const TiposTab: React.FC = () => {
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError('');
      const tiposData = await investorsApi.getAllTipos();
      setTipos(tiposData);
    } catch (error) {
      setError('Error al cargar los tipos');
      console.error('Error loading tipos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoNombre = (esMicro: boolean) => esMicro ? 'Microinversionista' : 'Inversionista';

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Tipos de Inversores</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tipos.map((tipo) => (
          <Card key={tipo.id} className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${tipo.esMicroinversionista ? 'bg-blue-500' : 'bg-green-500'}`}></div>
              <div>
                <h3 className="font-semibold text-gray-900">{getTipoNombre(tipo.esMicroinversionista)}</h3>
                <p className="text-sm text-gray-500">ID: {tipo.id}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Reportes Tab Component
const ReportesTab: React.FC = () => {
  const [reporteInversor, setReporteInversor] = useState<ReporteInversorDto[]>([]);
  const [reporteGeneral, setReporteGeneral] = useState<ReporteGeneralDto | null>(null);
  const [inversores, setInversores] = useState<Inversor[]>([]);
  const [selectedInversor, setSelectedInversor] = useState<string>('');
  const [searchInversor, setSearchInversor] = useState('');
  const [showReporteDropdown, setShowReporteDropdown] = useState(false);
  const [error, setError] = useState('');
  const [loadingReporteInversor, setLoadingReporteInversor] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState('Ambos');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());

  const loadReporteInversor = async (inversorId?: string) => {
    setLoadingReporteInversor(true);
    try {
      const data = await investorsApi.getReporteInversor(inversorId);
      setReporteInversor(data);
    } catch (error) {
      setError('Error al cargar reporte de inversor');
      console.error('Error loading reporte inversor:', error);
    } finally {
      setLoadingReporteInversor(false);
    }
  };

  const loadInversores = async () => {
    try {
      const data = await investorsApi.getAllInversores();
      setInversores(data);
    } catch (error) {
      console.error('Error loading inversores:', error);
    }
  };

  const loadReporteGeneral = async () => {
    try {
      setError('');
      const data = await investorsApi.getReporteGeneral(tipoFiltro, mes, anio);
      console.log('Reporte general data:', data);
      setReporteGeneral(data);
    } catch (error) {
      setError('Error al cargar reporte general');
      console.error('Error loading reporte general:', error);
      setReporteGeneral(null);
    }
  };

  useEffect(() => {
    loadInversores();
  }, []);

  useEffect(() => {
    loadReporteGeneral();
  }, [tipoFiltro, mes, anio]); // eslint-disable-line react-hooks/exhaustive-deps

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Excelente': return 'text-green-600';
      case 'Bueno': return 'text-yellow-600';
      case 'Aceptable': return 'text-orange-600';
      case 'Malo': return 'text-red-600';
      case 'Abandono': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Excelente': return '✓';
      case 'Bueno': return '⚠';
      case 'Aceptable': return '⚡';
      case 'Malo': return '✗';
      case 'Abandono': return '🚫';
      default: return '❓';
    }
  };

  const cambioData = reporteGeneral ? [
    { name: 'Soles', cambio: reporteGeneral.porcentajeCambioSoles ?? 0 },
    { name: 'Dólares', cambio: reporteGeneral.porcentajeCambioDolares ?? 0 },
    { name: 'Euros', cambio: reporteGeneral.porcentajeCambioEuros ?? 0 }
  ] : [];

  const hasReporteData = cambioData.some(d => Math.abs(d.cambio) > 0);

  const handleBuscarReporte = async () => {
    if (selectedInversor) {
      await loadReporteInversor(selectedInversor);
    } else {
      setError('Por favor, seleccione un inversor');
    }
  };

  const filteredInversoresReporte = inversores.filter(inv => 
    inv.nombre.toLowerCase().includes(searchInversor.toLowerCase())
  );

  const handleSelectInversorReporte = (inversor: Inversor) => {
    setSelectedInversor(inversor.id);
    setSearchInversor(inversor.nombre);
    setShowReporteDropdown(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Reportes de Inversores</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Reporte General */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Reporte General</h3>
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Ambos">Ambos</option>
              <option value="Microinversionistas">Microinversionistas</option>
              <option value="Inversionistas">Inversionistas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Mes {i + 1}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md w-24"
            />
          </div>
        </div>

        {reporteGeneral && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{reporteGeneral.totalSoles?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-gray-600">Total Soles</p>
              {reporteGeneral.porcentajeCambioSoles != null && (
                <p className={`text-sm font-medium ${reporteGeneral.porcentajeCambioSoles >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {reporteGeneral.porcentajeCambioSoles >= 0 ? '↑' : '↓'} {Math.abs(reporteGeneral.porcentajeCambioSoles).toFixed(2)}%
                </p>
              )}
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{reporteGeneral.totalDolares?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-gray-600">Total Dólares</p>
              {reporteGeneral.porcentajeCambioDolares != null && (
                <p className={`text-sm font-medium ${reporteGeneral.porcentajeCambioDolares >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {reporteGeneral.porcentajeCambioDolares >= 0 ? '↑' : '↓'} {Math.abs(reporteGeneral.porcentajeCambioDolares).toFixed(2)}%
                </p>
              )}
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{reporteGeneral.totalEuros?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-gray-600">Total Euros</p>
              {reporteGeneral.porcentajeCambioEuros != null && (
                <p className={`text-sm font-medium ${reporteGeneral.porcentajeCambioEuros >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {reporteGeneral.porcentajeCambioEuros >= 0 ? '↑' : '↓'} {Math.abs(reporteGeneral.porcentajeCambioEuros).toFixed(2)}%
                </p>
              )}
            </div>
          </div>
        )}

        {hasReporteData ? (
          <div className="flex justify-center">
            <BarChart width={600} height={300} data={cambioData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Cambio %', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Cambio']} />
              <Bar dataKey="cambio">
                {cambioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cambio >= 0 ? '#28a745' : '#dc3545'} />
                ))}
              </Bar>
            </BarChart>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No hay cambios porcentuales para mostrar en el gráfico</p>
            <p className="text-sm mt-2">(Puede que no haya datos del mes anterior para comparar)</p>
          </div>
        )}
      </Card>

      {/* Reporte por Inversor */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Reporte por Inversor</h3>
        
        {/* Búsqueda de Inversor */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Inversor</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={searchInversor}
                onChange={(e) => {
                  setSearchInversor(e.target.value);
                  setShowReporteDropdown(true);
                  if (!e.target.value) {
                    setSelectedInversor('');
                  }
                }}
                onFocus={() => setShowReporteDropdown(true)}
                placeholder="Buscar inversor por nombre..."
                icon={<Search className="w-4 h-4" />}
              />
              {showReporteDropdown && searchInversor && filteredInversoresReporte.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredInversoresReporte.slice(0, 10).map((inversor) => (
                    <button
                      key={inversor.id}
                      type="button"
                      onClick={() => handleSelectInversorReporte(inversor)}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                    >
                      <div className="font-medium text-gray-900">{inversor.nombre}</div>
                      <div className="text-sm text-gray-500">{inversor.nombreRegion || inversor.region?.nombres}</div>
                    </button>
                  ))}
                </div>
              )}
              {showReporteDropdown && searchInversor && filteredInversoresReporte.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-center text-gray-500">
                  No se encontraron inversores
                </div>
              )}
            </div>
            <Button 
              onClick={handleBuscarReporte}
              disabled={loadingReporteInversor || !selectedInversor}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loadingReporteInversor ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4 mr-2" />}
              Buscar
            </Button>
          </div>
        </div>

        {loadingReporteInversor && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {!loadingReporteInversor && reporteInversor.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Seleccione un inversor para ver su reporte</p>
          </div>
        )}

        {!loadingReporteInversor && reporteInversor.length > 0 && (
        <div className="space-y-4">
          {reporteInversor.map((inv) => (
            <div key={inv.inversorId} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{inv.nombreInversor}</h4>
                  <p className="text-sm text-gray-600">{inv.nombreRegion}</p>
                </div>
                <Badge className={getEstadoColor(inv.estado)}>
                  {getEstadoIcon(inv.estado)} {inv.estado}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{inv.totalSoles.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Soles</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{inv.totalDolares.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Dólares</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-yellow-600">{inv.totalEuros.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Euros</p>
                </div>
              </div>
              <div className="flex gap-4">
                <PieChart width={200} height={200}>
                  <Pie
                    data={[
                      { name: 'Micro', value: inv.pagosMicroinversionista.reduce((sum, p) => sum + p.monto, 0) },
                      { name: 'Inversionista', value: inv.pagosInversionista.reduce((sum, p) => sum + p.monto, 0) }
                    ]}
                    cx={100}
                    cy={100}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#FF6384" />
                    <Cell fill="#36A2EB" />
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Monto']} />
                </PieChart>
                <BarChart width={300} height={200} data={[{
                  name: inv.nombreInversor,
                  Soles: inv.totalSoles,
                  Dolares: inv.totalDolares,
                  Euros: inv.totalEuros
                }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Soles" fill="#8884d8" />
                  <Bar dataKey="Dolares" fill="#82ca9d" />
                  <Bar dataKey="Euros" fill="#ffc658" />
                </BarChart>
              </div>
            </div>
          ))}
        </div>
        )}
      </Card>
    </div>
  );
};