import React, { useState, useEffect } from 'react';
import { Users, CreditCard, Tag, BarChart3, Plus, Edit, Search, DollarSign, Coins, Euro, MapPin, Filter, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Pagination } from '../ui/Pagination';
import { Inversor, InversorRequest, PagoInversor, PagoInversorRequest, Tipo, Region } from '../../types';
import { investorsApi, regionsApi } from '../../services/api';
import { ReportesInversoresModule } from './InvestorReportsModule';
import { useAuth } from '../../contexts/AuthContext';
import { GastosModule } from './GastosModule';

export const InvestorsModule: React.FC = () => {
  const { user } = useAuth();
  // Usuarios con permiso restringido (solo ver inversores, pagos y gastos)
  // DNI '00516107' => restricted (no tipos/reportes). DNI '003871056' => restricted + only microinversionista pagos.
  const isRestrictedUser = user?.dni === '00516107' || user?.dni === '003871056';

  // Restaurar la pestaña activa desde localStorage si existe y es válida, respetando los permisos del usuario
  const [activeTab, setActiveTab] = useState<'inversores' | 'pagos' | 'gastos' | 'tipos' | 'reportes'>(() => {
    try {
      const saved = localStorage.getItem('investors_active_tab') as any;
      const allowedTabs = ['inversores', 'pagos', 'gastos', 'tipos', 'reportes'];
      if (saved && allowedTabs.includes(saved)) {
        if (isRestrictedUser && !['inversores', 'pagos', 'gastos'].includes(saved)) {
          return 'inversores';
        }
        return saved;
      }
    } catch (e) {
      // ignore and fallback
    }
    return 'inversores';
  });

  // Si el usuario está restringido y la pestaña activa no está permitida, forzar a 'inversores'
  useEffect(() => {
    if (isRestrictedUser && !['inversores', 'pagos', 'gastos'].includes(activeTab)) {
      setActiveTab('inversores');
    }
  }, [isRestrictedUser, activeTab]);

  // Guardar la pestaña activa en localStorage para restaurarla en recargas
  useEffect(() => {
    try {
      localStorage.setItem('investors_active_tab', activeTab);
    } catch (e) {
      // ignore
    }
  }, [activeTab]);

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
            onClick={() => setActiveTab('gastos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'gastos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Gastos
          </button>
          {!isRestrictedUser && (
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
          )}
          {!isRestrictedUser && (
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
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'inversores' && <InversoresTab />}
      {activeTab === 'pagos' && <PagosTab />}
      {activeTab === 'gastos' && <GastosTab />}
      {!isRestrictedUser && activeTab === 'tipos' && <TiposTab />}
      {!isRestrictedUser && activeTab === 'reportes' && <ReportesTab /> }
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
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [formData, setFormData] = useState<InversorRequest>({
    nombre: '',
    idRegion: '',
    montoMensualCuota: 0,
    currencyCuota: 1 // Default: Soles
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
        await investorsApi.updateInversor(editingInversor.id, formData);
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
    setFormData({ nombre: '', idRegion: '', montoMensualCuota: 0, currencyCuota: 1 });
    setEditingInversor(null);
  };

  const getCurrencyName = (currency: number | string): string => {
    if (typeof currency === 'string') {
      return currency; // Ya es el nombre
    }
    switch (currency) {
      case 0: return 'Dólares';
      case 1: return 'Soles';
      case 2: return 'Euros';
      default: return 'N/A';
    }
  };

  const getCurrencyVariant = (currency: number | string): 'primary' | 'success' | 'warning' => {
    const currencyName = typeof currency === 'string' ? currency : getCurrencyName(currency);
    switch (currencyName) {
      case 'Dólares':
      case 'Dolares':
        return 'success'; // Dólares - verde
      case 'Soles':
        return 'primary'; // Soles - azul
      case 'Euros':
        return 'warning'; // Euros - amarillo
      default:
        return 'primary';
    }
  };

  const currencyToString = (currency: number | string): string => {
    if (typeof currency === 'string') return currency;
    switch (currency) {
      case 0: return 'Dolares';
      case 1: return 'Soles';
      case 2: return 'Euros';
      default: return 'Soles';
    }
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (inversor: Inversor) => {
    setEditingInversor(inversor);
    setFormData({
      nombre: inversor.nombre,
      idRegion: inversor.idRegion,
      montoMensualCuota: inversor.montoMensualCuota,
      currencyCuota: currencyToString(inversor.currencyCuota)
    });
    setIsModalOpen(true);
  };

  const filteredInversores = inversores.filter(inversor => {
    const matchesSearch = inversor.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !selectedRegion || inversor.idRegion === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  // Paginación aplicada DESPUÉS del filtrado
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInversores = filteredInversores.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInversores.length / itemsPerPage);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRegion]);

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
        <div className="flex gap-4 items-center">
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
          <div className="w-40">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Mostrando {filteredInversores.length === 0 ? 0 : indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredInversores.length)} de {filteredInversores.length} inversores
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cuota Mensual
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
              {currentInversores.map((inversor) => (
                <tr key={inversor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {inversor.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {inversor.nombreRegion || inversor.region?.nombres || 'Sin región'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {inversor.montoMensualCuota?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge variant={getCurrencyVariant(inversor.currencyCuota)}>
                      {getCurrencyName(inversor.currencyCuota)}
                    </Badge>
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
        
        {/* Paginación Inversores */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredInversores.length}
            />
          </div>
        )}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuota Mensual
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.montoMensualCuota}
                onChange={(e) => setFormData(prev => ({ ...prev, montoMensualCuota: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda de Cuota
              </label>
              <select
                value={formData.currencyCuota}
                onChange={(e) => setFormData(prev => ({ ...prev, currencyCuota: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={1}>Soles</option>
                <option value={0}>Dólares</option>
                <option value={2}>Euros</option>
              </select>
            </div>
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
  const { user } = useAuth();
  // Usuarios restringidos comparten vista limitada. '003871056' además sólo puede crear pagos para microinversionistas.
  const isRestrictedUser = user?.dni === '00516107' || user?.dni === '003871056';
  const isMicroOnlyUser = user?.dni === '003871056';

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

  // Filtrar tipos disponibles según permisos del usuario
  // - Para '003871056' (micro-only): permitir SOLO microinversionista
  // - Para '00516107' (restricted): no permitir microinversionista
  const availableTipos = isMicroOnlyUser
    ? tipos.filter(t => t.esMicroinversionista)
    : isRestrictedUser
      ? tipos.filter(t => !t.esMicroinversionista)
      : tipos; 

  // Si usuario restringido abre modal y no hay tipo seleccionado, preseleccionar un tipo válido
  useEffect(() => {
    if (isModalOpen && tipos.length > 0) {
      if (isMicroOnlyUser) {
        const defaultTipo = tipos.find(t => t.esMicroinversionista);
        if (defaultTipo) setFormData(prev => ({ ...prev, idTipo: defaultTipo.id }));
      } else if (isRestrictedUser) {
        const defaultTipo = tipos.find(t => !t.esMicroinversionista);
        if (defaultTipo) setFormData(prev => ({ ...prev, idTipo: defaultTipo.id }));
      }
    }
  }, [isModalOpen, tipos, isRestrictedUser, isMicroOnlyUser]);
  
  // Filtros
  const [searchInversor, setSearchInversor] = useState('');
  const [filterCurrency, setFilterCurrency] = useState<number | ''>('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterFechaInicio, setFilterFechaInicio] = useState('');
  const [filterFechaFin, setFilterFechaFin] = useState('');
  
  // Paginación
  const [currentPagePagos, setCurrentPagePagos] = useState(1);
  const [itemsPerPagePagos, setItemsPerPagePagos] = useState(10);
  
  // Boleta
  const [boletaPago, setBoletaPago] = useState<PagoInversor | null>(null);
  const [isBoletaModalOpen, setIsBoletaModalOpen] = useState(false);
  
  // Búsqueda de inversor en formulario
  const [inversorSearchTerm, setInversorSearchTerm] = useState('');
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
    setError('');
    try {
      // Validacion extra según permisos:
      const selectedTipo = tipos.find(t => t.id === formData.idTipo);
      if (isMicroOnlyUser) {
        // Solo tipos microinversionista permitidos
        if (!selectedTipo?.esMicroinversionista) {
          setError('No autorizado: solo tipos Microinversionista permitidos para su cuenta');
          setSubmitting(false);
          return;
        }
      } else if (isRestrictedUser) {
        // Usuario restringido (00516107): no permitir microinversionista
        if (selectedTipo?.esMicroinversionista) {
          setError('No autorizado para seleccionar tipo Microinversionista');
          setSubmitting(false);
          return;
        }
      }

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
    setShowInversorDropdown(false);
  };

  // Normalizar currency a número para comparaciones
  const normalizeCurrency = (currency: number | string): number => {
    if (typeof currency === 'number') return currency;
    // Si es string, mapear a número
    const currencyMap: Record<string, number> = {
      'Dolares': 0,
      'Dólares': 0,
      'Soles': 1,
      'Euros': 2
    };
    return currencyMap[currency] ?? -1;
  };

  // Normalizar tipo a boolean para comparaciones
  const normalizeTipo = (pago: PagoInversor): boolean | undefined => {
    if (pago.tipo?.esMicroinversionista !== undefined) {
      return pago.tipo.esMicroinversionista;
    }
    if (pago.esMicroinversionista !== undefined) {
      return pago.esMicroinversionista;
    }
    return undefined;
  };

  const getCurrencyIcon = (currency: number | string) => {
    const num = normalizeCurrency(currency);
    switch (num) {
      case 0: return <DollarSign className="w-4 h-4 text-green-600" />;
      case 1: return <Coins className="w-4 h-4 text-blue-600" />;
      case 2: return <Euro className="w-4 h-4 text-yellow-600" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getCurrencyName = (currency: number | string): string => {
    if (typeof currency === 'string') {
      return currency; // Ya es el nombre como "Dolares", "Soles", "Euros"
    }
    switch (currency) {
      case 0: return 'Dólares';
      case 1: return 'Soles';
      case 2: return 'Euros';
      default: return 'Desconocido';
    }
  };

  const getCurrencySymbol = (currency: number | string): string => {
    if (typeof currency === 'string') {
      // Mapear string a símbolo
      const symbolMap: Record<string, string> = {
        'Dolares': '$',
        'Dólares': '$',
        'Soles': 'S/',
        'Euros': '€'
      };
      return symbolMap[currency] || '';
    }
    switch (currency) {
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
    setInversorSearchTerm(inversor.nombre);
    setShowInversorDropdown(false);
  };

  const filteredPagos = pagos.filter(pago => {
    const inversorNombre = getInversorNombre(pago.idInversor).toLowerCase();
    const matchesInversor = !searchInversor || inversorNombre.includes(searchInversor.toLowerCase());
    
    // Normalizar currency para comparación correcta
    const pagoCurrency = normalizeCurrency(pago.currency);
    const matchesCurrency = filterCurrency === '' || pagoCurrency === filterCurrency;
    
    // Normalizar tipo para comparación correcta
    let matchesTipo = true;
    if (filterTipo) {
      const selectedTipo = tipos.find(t => t.id === filterTipo);
      if (selectedTipo) {
        const pagoTipo = normalizeTipo(pago);
        matchesTipo = pagoTipo !== undefined && pagoTipo === selectedTipo.esMicroinversionista;
      }
    }
    
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

  // Paginación aplicada DESPUÉS del filtrado
  const indexOfLastPago = currentPagePagos * itemsPerPagePagos;
  const indexOfFirstPago = indexOfLastPago - itemsPerPagePagos;
  const currentPagos = filteredPagos.slice(indexOfFirstPago, indexOfLastPago);
  const totalPagesPagos = Math.ceil(filteredPagos.length / itemsPerPagePagos);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPagePagos(1);
  }, [searchInversor, filterCurrency, filterTipo, filterFechaInicio, filterFechaFin]);

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
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="text-sm text-gray-600">
            Mostrando {filteredPagos.length === 0 ? 0 : indexOfFirstPago + 1} - {Math.min(indexOfLastPago, filteredPagos.length)} de {filteredPagos.length} pagos
          </div>
          <div className="w-40">
            <select
              value={itemsPerPagePagos}
              onChange={(e) => {
                setItemsPerPagePagos(Number(e.target.value));
                setCurrentPagePagos(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
            </select>
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
              {currentPagos.map((pago) => (
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
                    {pago.tipo?.esMicroinversionista !== undefined 
                      ? getTipoNombre(pago.tipo.esMicroinversionista)
                      : pago.esMicroinversionista !== undefined
                        ? getTipoNombre(pago.esMicroinversionista)
                        : 'Sin tipo'}
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
        
        {/* Paginación Pagos */}
        {totalPagesPagos > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPagePagos}
              totalPages={totalPagesPagos}
              onPageChange={setCurrentPagePagos}
              itemsPerPage={itemsPerPagePagos}
              totalItems={filteredPagos.length}
            />
          </div>
        )}
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
              {availableTipos.map(tipo => (
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

// Gastos Tab Component - Reutiliza el módulo de Gastos
const GastosTab: React.FC = () => {
  return <GastosModule />;
};

// Reportes Tab Component - Usa el nuevo módulo mejorado
const ReportesTab: React.FC = () => {
  const [inversores, setInversores] = useState<Inversor[]>([]);

  useEffect(() => {
    loadInversores();
  }, []);

  const loadInversores = async () => {
    try {
      const data = await investorsApi.getAllInversores();
      setInversores(data);
    } catch (error) {
      console.error('Error loading inversores:', error);
    }
  };

  return <ReportesInversoresModule inversores={inversores} />;
};