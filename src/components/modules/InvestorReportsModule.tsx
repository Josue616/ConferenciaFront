import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Coins, Euro, Users, Search, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ReporteInversorDto, ReporteGeneralDto, ReporteGastosIngresosDto, Inversor } from '../../types';
import { investorsApi } from '../../services/api';
import { BarChart, Bar, Cell, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportesInversoresModuleProps {
  inversores?: Inversor[];
}

export const ReportesInversoresModule: React.FC<ReportesInversoresModuleProps> = ({ inversores: inversorsProp }) => {
  const [activeTab, setActiveTab] = useState<'inversor' | 'general' | 'financiero'>('inversor');
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes de Inversores</h1>
          <p className="text-gray-600 mt-1">Análisis detallado de ingresos y gastos</p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('inversor')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inversor'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Por Inversor
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            General Mensual
          </button>
          <button
            onClick={() => setActiveTab('financiero')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'financiero'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Gastos vs Ingresos
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'inversor' && <ReportePorInversor inversoresProp={inversorsProp} />}
      {activeTab === 'general' && <ReporteGeneral />}
      {activeTab === 'financiero' && <ReporteFinanciero />}
    </div>
  );
};

// Reporte por Inversor
const ReportePorInversor: React.FC<{ inversoresProp?: Inversor[] }> = ({ inversoresProp }) => {
  const [reportes, setReportes] = useState<ReporteInversorDto[]>([]);
  const [inversores, setInversores] = useState<Inversor[]>([]);
  const [selectedInversor, setSelectedInversor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (inversoresProp) {
      setInversores(inversoresProp);
    } else {
      loadInversores();
    }
  }, [inversoresProp]);

  const loadInversores = async () => {
    try {
      const data = await investorsApi.getAllInversores();
      setInversores(data);
    } catch (error) {
      console.error('Error loading inversores:', error);
    }
  };

  const loadReporte = async (inversorId?: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await investorsApi.getReporteInversor(inversorId);
      setReportes(data);
    } catch (error) {
      setError('Error al cargar el reporte');
      console.error('Error loading reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInversor = (inversor: Inversor) => {
    setSelectedInversor(inversor.id);
    setSearchTerm(inversor.nombre);
    setShowDropdown(false);
  };

  const handleBuscar = () => {
    if (selectedInversor) {
      loadReporte(selectedInversor);
    } else {
      loadReporte(); // Todos los inversores
    }
  };

  const filteredInversores = inversores.filter(inv => 
    inv.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoConfig = (estado: string) => {
    const configs: Record<string, { color: string; icon: string; bgColor: string }> = {
      'Excelente': { color: 'text-green-700', icon: '✓', bgColor: 'bg-green-100' },
      'Bueno': { color: 'text-yellow-700', icon: '⚠', bgColor: 'bg-yellow-100' },
      'Aceptable': { color: 'text-orange-700', icon: '⚡', bgColor: 'bg-orange-100' },
      'Deficiente': { color: 'text-red-700', icon: '✗', bgColor: 'bg-red-100' },
      'Abandono': { color: 'text-gray-700', icon: '🚫', bgColor: 'bg-gray-100' }
    };
    return configs[estado] || { color: 'text-gray-700', icon: '❓', bgColor: 'bg-gray-100' };
  };

  return (
    <div className="space-y-6">
      {/* Búsqueda */}
      <Card className="p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Buscar inversor o dejar vacío para todos..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
                if (!e.target.value) setSelectedInversor('');
              }}
              onFocus={() => setShowDropdown(true)}
              icon={<Search className="w-4 h-4" />}
            />
            {showDropdown && searchTerm && filteredInversores.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredInversores.slice(0, 10).map((inversor) => (
                  <button
                    key={inversor.id}
                    onClick={() => handleSelectInversor(inversor)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-0"
                  >
                    <div className="font-medium text-gray-900">{inversor.nombre}</div>
                    <div className="text-xs text-gray-500">{inversor.nombreRegion || 'Sin región'}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button onClick={handleBuscar} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4 mr-2" />}
            Buscar
          </Button>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Resultados */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : reportes.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Busca un inversor o deja vacío para ver todos</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {reportes.map((reporte) => {
            const estadoConfig = getEstadoConfig(reporte.estado);
            const totalPagos = reporte.numeroPagosMicroinversionista + reporte.numeroPagosInversionista;
            
            // Datos para gráfico de pastel
            const pieData = [
              { name: 'Microinversionista', value: reporte.numeroPagosMicroinversionista, color: '#FF6384' },
              { name: 'Inversionista', value: reporte.numeroPagosInversionista, color: '#36A2EB' }
            ].filter(item => item.value > 0);

            // Datos para gráfico de barras de montos
            const barData = [
              { name: 'Soles', monto: reporte.totalSoles, color: '#3b82f6' },
              { name: 'Dólares', monto: reporte.totalDolares, color: '#10b981' },
              { name: 'Euros', monto: reporte.totalEuros, color: '#f59e0b' }
            ].filter(item => item.monto > 0);

            // Datos de cumplimiento
            const cumplimientoData = [
              { name: 'Soles', cumplimiento: reporte.porcentajeCumplimientoSoles || 0 },
              { name: 'Dólares', cumplimiento: reporte.porcentajeCumplimientoDolares || 0 }
            ].filter(item => item.cumplimiento > 0);

            return (
              <Card key={reporte.inversorId} className="p-6">
                {/* Header del inversor */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{reporte.nombreInversor}</h3>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <span className="text-sm">📍 {reporte.nombreRegion}</span>
                    </p>
                  </div>
                  <div className={`${estadoConfig.bgColor} ${estadoConfig.color} px-4 py-2 rounded-lg font-semibold`}>
                    <span className="mr-2">{estadoConfig.icon}</span>
                    {reporte.estado}
                  </div>
                </div>

                {/* Totales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">Soles</span>
                      <Coins className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">S/ {reporte.totalSoles.toFixed(2)}</p>
                    {reporte.montoEsperadoSoles > 0 && (
                      <div className="mt-2 text-xs">
                        <p className="text-gray-600">Esperado: S/ {reporte.montoEsperadoSoles.toFixed(2)}</p>
                        <p className={reporte.diferenciaSoles >= 0 ? 'text-green-600' : 'text-red-600'}>
                          Diferencia: {reporte.diferenciaSoles >= 0 ? '+' : ''}{reporte.diferenciaSoles.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700">Dólares</span>
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">$ {reporte.totalDolares.toFixed(2)}</p>
                    {reporte.montoEsperadoDolares > 0 && (
                      <div className="mt-2 text-xs">
                        <p className="text-gray-600">Esperado: $ {reporte.montoEsperadoDolares.toFixed(2)}</p>
                        <p className={reporte.diferenciaDolares >= 0 ? 'text-green-600' : 'text-red-600'}>
                          Diferencia: {reporte.diferenciaDolares >= 0 ? '+' : ''}{reporte.diferenciaDolares.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-yellow-700">Euros</span>
                      <Euro className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-900">€ {reporte.totalEuros.toFixed(2)}</p>
                    <div className="mt-2 text-xs">
                      <p className="text-gray-600">{totalPagos} pago{totalPagos !== 1 ? 's' : ''} total{totalPagos !== 1 ? 'es' : ''}</p>
                    </div>
                  </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de distribución de pagos */}
                  {pieData.length > 0 && (
                    <Card className="p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Distribución de Pagos</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  )}

                  {/* Gráfico de montos por moneda */}
                  {barData.length > 0 && (
                    <Card className="p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Montos por Moneda</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="monto" fill="#8884d8">
                            {barData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  )}

                  {/* Gráfico de cumplimiento */}
                  {cumplimientoData.length > 0 && (
                    <Card className="p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">% Cumplimiento de Cuota</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={cumplimientoData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 150]} />
                          <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                          <Bar dataKey="cumplimiento">
                            {cumplimientoData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.cumplimiento >= 100
                                    ? '#10b981'
                                    : entry.cumplimiento >= 80
                                    ? '#f59e0b'
                                    : '#ef4444'
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  )}
                </div>

                {/* Detalle de pagos */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reporte.pagosMicroinversionista.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Pagos Microinversionista ({reporte.numeroPagosMicroinversionista})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {reporte.pagosMicroinversionista.map((pago, idx) => (
                          <div key={idx} className="text-xs bg-pink-50 p-2 rounded">
                            <span className="font-medium">{pago.currency} {pago.monto.toFixed(2)}</span>
                            <span className="text-gray-600 ml-2">{new Date(pago.fechaCreacion).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {reporte.pagosInversionista.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Pagos Inversionista ({reporte.numeroPagosInversionista})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {reporte.pagosInversionista.map((pago, idx) => (
                          <div key={idx} className="text-xs bg-blue-50 p-2 rounded">
                            <span className="font-medium">{pago.currency} {pago.monto.toFixed(2)}</span>
                            <span className="text-gray-600 ml-2">{new Date(pago.fechaCreacion).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Reporte General Mensual
const ReporteGeneral: React.FC = () => {
  const [reporte, setReporte] = useState<ReporteGeneralDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tipo, setTipo] = useState('Ambos');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());

  useEffect(() => {
    loadReporte();
  }, [tipo, mes, anio]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReporte = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await investorsApi.getReporteGeneral(tipo, mes, anio);
      setReporte(data);
    } catch (error) {
      setError('Error al cargar el reporte general');
      console.error('Error loading reporte general:', error);
      setReporte(null); // Asegurar que reporte se establezca en null en caso de error
    } finally {
      setLoading(false);
    }
  };

  const cambioData = reporte ? [
    { name: 'Soles', cambio: reporte.porcentajeCambioSoles ?? 0 },
    { name: 'Dólares', cambio: reporte.porcentajeCambioDolares ?? 0 },
    { name: 'Euros', cambio: reporte.porcentajeCambioEuros ?? 0 }
  ] : [];

  const evolucionData = reporte ? [
    {
      name: 'Mes Anterior',
      Soles: reporte.totalSolesMesAnterior ?? 0,
      Dólares: reporte.totalDolaresMesAnterior ?? 0,
      Euros: reporte.totalEurosMesAnterior ?? 0
    },
    {
      name: 'Mes Actual',
      Soles: reporte.totalSoles ?? 0,
      Dólares: reporte.totalDolares ?? 0,
      Euros: reporte.totalEuros ?? 0
    }
  ] : [];

  const mesesNombres = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onChange={(e) => setMes(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {mesesNombres.map((nombre, idx) => (
                <option key={idx + 1} value={idx + 1}>{nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <Input
              type="number"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
            />
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Resultados */}
      {!loading && error && (
        <div className="text-center py-8 text-red-600">{error}</div>
      )}
      
      {!loading && !error && !reporte && (
        <div className="text-center py-8 text-gray-600">No hay datos disponibles para el período seleccionado</div>
      )}

      {!loading && !error && reporte && (
        <>
          {/* Título del periodo */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {mesesNombres[mes - 1]} {anio}
            </h2>
            <p className="text-gray-600">Tipo: {reporte.tipoFiltro}</p>
          </div>

          {/* Cards de totales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600">Total Soles</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">S/ {reporte.totalSoles?.toFixed(2) ?? '0.00'}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Coins className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              {(reporte.porcentajeCambioSoles !== null && reporte.porcentajeCambioSoles !== undefined) && (
                <div className={`flex items-center gap-2 text-sm font-medium ${
                  reporte.porcentajeCambioSoles >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {reporte.porcentajeCambioSoles >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{Math.abs(reporte.porcentajeCambioSoles).toFixed(2)}% vs mes anterior</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Anterior: S/ {reporte.totalSolesMesAnterior?.toFixed(2) ?? '0.00'}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600">Total Dólares</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">$ {reporte.totalDolares?.toFixed(2) ?? '0.00'}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
              {(reporte.porcentajeCambioDolares !== null && reporte.porcentajeCambioDolares !== undefined) && (
                <div className={`flex items-center gap-2 text-sm font-medium ${
                  reporte.porcentajeCambioDolares >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {reporte.porcentajeCambioDolares >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{Math.abs(reporte.porcentajeCambioDolares).toFixed(2)}% vs mes anterior</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Anterior: $ {reporte.totalDolaresMesAnterior?.toFixed(2) ?? '0.00'}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600">Total Euros</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">€ {reporte.totalEuros?.toFixed(2) ?? '0.00'}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Euro className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              {(reporte.porcentajeCambioEuros !== null && reporte.porcentajeCambioEuros !== undefined) && (
                <div className={`flex items-center gap-2 text-sm font-medium ${
                  reporte.porcentajeCambioEuros >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {reporte.porcentajeCambioEuros >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{Math.abs(reporte.porcentajeCambioEuros).toFixed(2)}% vs mes anterior</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Anterior: € {reporte.totalEurosMesAnterior?.toFixed(2) ?? '0.00'}</p>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de evolución */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Evolución Mensual</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolucionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Soles" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Dólares" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="Euros" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Gráfico de cambios porcentuales */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cambios Porcentuales</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cambioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: '%', angle: 0, position: 'top' }} />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                  <Bar dataKey="cambio">
                    {cambioData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.cambio >= 0 ? '#10b981' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

// Reporte de Gastos vs Ingresos
const ReporteFinanciero: React.FC = () => {
  const [reporte, setReporte] = useState<ReporteGastosIngresosDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mes, setMes] = useState<number | null>(new Date().getMonth() + 1);
  const [anio, setAnio] = useState<number | null>(new Date().getFullYear());

  useEffect(() => {
    loadReporte();
  }, [mes, anio]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReporte = async () => {
    setLoading(true);
    setError('');
    try {
      let data: ReporteGastosIngresosDto;
      
      // Si no hay filtros (mes o año es null), usar endpoint global
      if (mes === null || anio === null) {
        data = await investorsApi.getReporteGastosIngresosGlobal();
      } else {
        data = await investorsApi.getReporteGastosIngresos(mes, anio);
      }
      
      setReporte(data);
    } catch (error) {
      setError('Error al cargar el reporte financiero');
      console.error('Error loading reporte financiero:', error);
    } finally {
      setLoading(false);
    }
  };

  const mesesNombres = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const ingresosVsGastosData = reporte ? [
    {
      categoria: 'Ingresos',
      Soles: reporte.totalIngresosSoles,
      Dólares: reporte.totalIngresosDolares
    },
    {
      categoria: 'Gastos',
      Soles: reporte.totalGastosSoles,
      Dólares: reporte.totalGastosDolares
    },
    {
      categoria: 'Balance',
      Soles: reporte.balanceSoles,
      Dólares: reporte.balanceDolares
    }
  ] : [];

  const getCategoriaName = (categoria: number | string): string => {
    if (typeof categoria === 'string') {
      return categoria; // Ya viene como string del API ("Marketing", "Personal", etc.)
    }
    switch (categoria) {
      case 0: return 'Marketing';
      case 1: return 'Infraestructura';
      case 2: return 'Personal';
      case 3: return 'Servicios';
      case 4: return 'Equipamiento';
      case 5: return 'Consultoría';
      case 6: return 'Legal';
      case 7: return 'Otros';
      default: return `Categoría ${categoria}`;
    }
  };

  const categoriasData = (reporte?.gastosPorCategoria || []).map(cat => ({
    ...cat,
    categoriaNombre: getCategoriaName(cat.categoria)
  }));

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <select
              value={mes ?? ''}
              onChange={(e) => setMes(e.target.value === '' ? null : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {mesesNombres.map((nombre, idx) => (
                <option key={idx + 1} value={idx + 1}>{nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <select
              value={anio ?? ''}
              onChange={(e) => setAnio(e.target.value === '' ? null : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
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

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Resultados */}
      {!loading && reporte && (
        <>
          {/* Título */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {mes === null || anio === null 
                ? 'Reporte Financiero Global' 
                : `Reporte Financiero - ${mesesNombres[(mes ?? 1) - 1]} ${anio}`
              }
            </h2>
          </div>

          {/* Estado Financiero */}
          {reporte.alertaConsumoSoles && (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800">{reporte.alertaConsumoSoles}</p>
              </div>
            </Card>
          )}

          <Card className={`p-6 ${reporte.estadoFinanciero === 'Positivo' ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center justify-center gap-3">
              {reporte.estadoFinanciero === 'Positivo' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-600" />
              )}
              <div className="text-center">
                <h3 className={`text-2xl font-bold ${reporte.estadoFinanciero === 'Positivo' ? 'text-green-900' : 'text-red-900'}`}>
                  Estado: {reporte.estadoFinanciero}
                </h3>
                <p className="text-sm text-gray-700 mt-1">
                  Balance Total: S/ {reporte.balanceTotalSoles.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {/* Cards de resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-blue-50">
              <p className="text-sm text-gray-700">Ingresos Soles</p>
              <p className="text-2xl font-bold text-blue-900">S/ {reporte.totalIngresosSoles.toFixed(2)}</p>
            </Card>
            <Card className="p-4 bg-green-50">
              <p className="text-sm text-gray-700">Ingresos Dólares</p>
              <p className="text-2xl font-bold text-green-900">$ {reporte.totalIngresosDolares.toFixed(2)}</p>
            </Card>
            <Card className="p-4 bg-orange-50">
              <p className="text-sm text-gray-700">Gastos Soles</p>
              <p className="text-2xl font-bold text-orange-900">S/ {reporte.totalGastosSoles.toFixed(2)}</p>
            </Card>
            <Card className="p-4 bg-red-50">
              <p className="text-sm text-gray-700">Gastos Dólares</p>
              <p className="text-2xl font-bold text-red-900">$ {reporte.totalGastosDolares.toFixed(2)}</p>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Ingresos vs Gastos */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Ingresos vs Gastos vs Balance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ingresosVsGastosData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Soles" fill="#3b82f6" />
                  <Bar dataKey="Dólares" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Gráfico de Gastos por Categoría */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Gastos por Categoría</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoriasData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry: any) => entry.categoriaNombre}
                    outerRadius={100}
                    dataKey="montoTotalSoles"
                    nameKey="categoriaNombre"
                  >
                    {categoriasData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#4BC0C0'][index % 8]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Tablas de detalle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Detalle de Gastos */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Detalle de Gastos por Categoría</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Monto (S/)</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Trans.</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoriasData.map((cat, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{cat.categoriaNombre}</td>
                        <td className="px-4 py-2 text-sm text-right font-semibold">{cat.montoTotalSoles.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-600">{cat.numeroTransacciones}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Detalle de Ingresos */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Detalle de Ingresos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Soles</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Dólares</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Pagos</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reporte.detalleIngresos.map((detalle, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{detalle.tipoInversor}</td>
                        <td className="px-4 py-2 text-sm text-right font-semibold text-blue-600">
                          {detalle.montoSoles.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-semibold text-green-600">
                          {detalle.montoDolares.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-gray-600">{detalle.numeroPagos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
