import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  LineChart,
  Line
} from 'recharts';
import { FileDown, BarChart3, Users, Wallet, AlertTriangle, Filter } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { useAuth } from '../../contexts/AuthContext';
import { conferencesApi, regionsApi, reportsApi } from '../../services/api';
import {
  Conference,
  Region,
  ConferenceFinancialReport
} from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const AMOUNT_COLORS = ['#3b82f6', '#22c55e', '#f97316'];

export const ConferenceReportsModule: React.FC = () => {
  const { isAdmin } = useAuth();
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedConference, setSelectedConference] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<ConferenceFinancialReport | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const loadInitialData = async () => {
      setInitialLoading(true);
      setError('');
      try {
        const [conferencesData, regionsData] = await Promise.all([
          conferencesApi.getAll(),
          regionsApi.getAll()
        ]);

        const sortedConferences = [...conferencesData].sort((a, b) => a.nombres.localeCompare(b.nombres));
        setConferences(sortedConferences);
        setRegions(regionsData);

        const defaultConferenceId = sortedConferences[0]?.id || '';
        setSelectedConference(defaultConferenceId);
  setSelectedRegion('');

        if (defaultConferenceId) {
          await fetchReport(defaultConferenceId, '');
        }
      } catch (err) {
        console.error('Error loading initial report data:', err);
        setError('Error al cargar las conferencias o regiones. Intenta nuevamente.');
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, [isAdmin]);

  const fetchReport = async (conferenceId: string, regionId: string) => {
    if (!conferenceId) {
      setReport(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await reportsApi.getConferenceFinancialReport(conferenceId, regionId || undefined);
      setReport(data);
    } catch (err) {
      console.error('Error fetching conference financial report:', err);
      setError('Error al obtener el reporte. Verifica la conexión y los filtros seleccionados.');
    } finally {
      setLoading(false);
    }
  };

  const handleConferenceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const conferenceId = event.target.value;
    setSelectedConference(conferenceId);
    setSelectedRegion('');
    if (conferenceId) {
      fetchReport(conferenceId, '');
    } else {
      setReport(null);
    }
  };

  const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = event.target.value;
    setSelectedRegion(regionId);
  };

  const handleGenerateReport = () => {
    fetchReport(selectedConference, selectedRegion);
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current || !report) {
      return;
    }

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const conferenceName = report.conferencia.nombres.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      const regionSuffix = selectedRegion ? `-${selectedRegion}` : '';
      pdf.save(`reporte-${conferenceName}${regionSuffix}.pdf`);
    } catch (err) {
      console.error('Error exporting report PDF:', err);
      setError('No se pudo generar el PDF. Intenta nuevamente.');
    }
  };

  const amountSummaryData = useMemo(() => {
    if (!report) {
      return [];
    }

    const pending = report.resumenParticipantes.diferencia;
    return [
      {
        name: 'Pagado',
        value: Number(report.resumenParticipantes.montoPagado.toFixed(2))
      },
      {
        name: pending >= 0 ? 'Pendiente' : 'Excedente',
        value: Number(Math.abs(pending).toFixed(2))
      }
    ];
  }, [report]);

  const regionBarData = useMemo(() => {
    if (!report) {
      return [];
    }

    return report.regiones.map((regionItem) => ({
      region: regionItem.regionNombre,
      participantes: regionItem.totalParticipantes,
      pagado: Number(regionItem.montoPagado.toFixed(2)),
      esperado: Number(regionItem.montoEsperado.toFixed(2)),
      diferencia: Number(regionItem.diferencia.toFixed(2))
    }));
  }, [report]);

  const trendData = useMemo(() => {
    if (!report) {
      return [];
    }

    const sortedRegions = [...report.regiones].sort((a, b) => b.montoPagado - a.montoPagado);
    return sortedRegions.map((regionItem, index) => ({
      name: `${index + 1}. ${regionItem.regionNombre}`,
      pagado: Number(regionItem.montoPagado.toFixed(2)),
      esperado: Number(regionItem.montoEsperado.toFixed(2))
    }));
  }, [report]);

  if (!isAdmin) {
    return (
      <Card className="max-w-xl mx-auto text-center">
        <h2 className="text-xl font-semibold text-gray-900">Acceso restringido</h2>
        <p className="mt-2 text-gray-600">Esta sección está disponible únicamente para administradores.</p>
      </Card>
    );
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes Financieros de Conferencias</h1>
          <p className="text-gray-600">Analiza al detalle la recaudación y participación de cada conferencia.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={Filter}
            onClick={handleGenerateReport}
            disabled={!selectedConference || loading}
          >
            Actualizar reporte
          </Button>
          <Button
            icon={FileDown}
            onClick={handleDownloadPdf}
            disabled={!report || loading}
          >
            Descargar PDF
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Card className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conferencia</label>
            <select
              value={selectedConference}
              onChange={handleConferenceChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
            >
              <option value="">Selecciona una conferencia</option>
              {conferences.map((conference) => (
                <option key={conference.id} value={conference.id}>
                  {conference.nombres}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por región (opcional)</label>
            <select
              value={selectedRegion}
              onChange={handleRegionChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
              disabled={!report && !selectedConference}
            >
              <option value="">Todas las regiones</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.nombres}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={handleGenerateReport}
              disabled={!selectedConference || loading}
              loading={loading}
            >
              Generar reporte
            </Button>
          </div>
        </div>
      </Card>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!loading && report && (
        <div ref={reportRef} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Conferencia</p>
                  <h3 className="text-lg font-semibold text-gray-900 mt-1 line-clamp-2">
                    {report.conferencia.nombres}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">{report.conferencia.regionConferencia}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Fechas:</span> {report.conferencia.fechaInicio} - {report.conferencia.fechaFin}
                </p>
                <p>
                  <span className="font-medium">Inscripción hasta:</span> {report.conferencia.fechaFinIns}
                </p>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Capacidad y aforo</p>
                  <h3 className="text-3xl font-semibold text-gray-900">
                    {report.conferencia.participantesRegistrados}/{report.conferencia.capacidad}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Disponible: {report.conferencia.capacidadDisponible}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Total esperado capacidad:</span> S/ {report.conferencia.totalEsperadoCapacidad.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Capacidad restante:</span> S/ {report.conferencia.diferenciaCapacidad.toFixed(2)}
                </p>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Resumen económico</p>
                  <h3 className="text-3xl font-semibold text-gray-900">
                    S/ {report.resumenParticipantes.montoPagado.toFixed(2)}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Esperado: S/ {report.resumenParticipantes.montoEsperado.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Participantes:</span> {report.resumenParticipantes.totalParticipantes}
                </p>
                <p>
                  <span className="font-medium">
                    {report.resumenParticipantes.diferencia >= 0 ? 'Pendiente:' : 'Excedente:'}
                  </span>{' '}
                  S/ {Math.abs(report.resumenParticipantes.diferencia).toFixed(2)}
                </p>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-medium">Pagos sin participación</p>
                  <h3 className="text-3xl font-semibold text-gray-900">
                    {report.pagosSinParticipacion.length}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">Pagos registrados sin inscripción</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Monto asociado:</span> S/ {
                    report.pagosSinParticipacion.reduce((acc, item) => acc + item.monto, 0).toFixed(2)
                  }
                </p>
                <p className="text-xs text-amber-600">Revisar para conciliar con inscripciones.</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de pagos</h3>
              <div className="h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={amountSummaryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={4}
                    >
                      {amountSummaryData.map((entry, index) => (
                        <Cell key={entry.name} fill={AMOUNT_COLORS[index % AMOUNT_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) => [`S/ ${value.toFixed(2)}`, '']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Participantes y montos por región</h3>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={regionBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" angle={-20} textAnchor="end" height={80} interval={0} />
                    <YAxis />
                    <RechartsTooltip formatter={(value: number) => [`S/ ${value.toFixed(2)}`, '']} />
                    <Legend />
                    <Bar dataKey="esperado" name="Monto esperado" fill="#60a5fa" />
                    <Bar dataKey="pagado" name="Monto pagado" fill="#22c55e" />
                    <Bar dataKey="diferencia" name="Diferencia" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ranking de recaudación por región</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: number) => [`S/ ${value.toFixed(2)}`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="esperado" name="Monto esperado" stroke="#60a5fa" strokeWidth={2} />
                  <Line type="monotone" dataKey="pagado" name="Monto pagado" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="space-y-6">
            <div className="space-y-4">
              {report.regiones.map((regionItem) => (
                <div key={regionItem.regionId} className="border border-blue-100 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{regionItem.regionNombre}</h4>
                      <p className="text-sm text-gray-600">
                        {regionItem.totalParticipantes} participantes · S/ {regionItem.montoPagado.toFixed(2)} pagado
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-blue-700 font-medium">Esperado: S/ {regionItem.montoEsperado.toFixed(2)}</span>
                      <span className={regionItem.diferencia >= 0 ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}>
                        {regionItem.diferencia >= 0 ? 'Pendiente:' : 'Excedente:'} S/ {Math.abs(regionItem.diferencia).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-blue-100">
                      <thead className="bg-blue-50/60">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Participante</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">DNI</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Servicio</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Almuerzo</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Cena</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Monto esperado</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Monto pagado</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Diferencia</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-blue-50">
                        {regionItem.participantes.map((participant) => (
                          <tr key={`${participant.dniUsuario}-${participant.fechaRegistro}`} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-4 py-2 text-sm text-gray-900">{participant.nombreUsuario}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{participant.dniUsuario}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{participant.servicio}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{participant.incluyeAlmuerzo ? 'Sí' : 'No'}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{participant.incluyeCena ? 'Sí' : 'No'}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">S/ {participant.montoEsperado.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">S/ {participant.totalPagado.toFixed(2)}</td>
                            <td className={participant.diferencia >= 0 ? 'px-4 py-2 text-sm text-amber-600 font-medium' : 'px-4 py-2 text-sm text-green-600 font-medium'}>
                              {participant.diferencia >= 0 ? 'Pendiente' : 'Excedente'} S/ {Math.abs(participant.diferencia).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {(report.pagosSinParticipacion.length > 0 || report.pagosFueraDelFiltro.length > 0) && (
            <Card className="space-y-4">
              {report.pagosSinParticipacion.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pagos sin participación registrada</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-blue-100">
                      <thead className="bg-blue-50/60">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">DNI</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Monto</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Fecha</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Comprobante</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-blue-50">
                        {report.pagosSinParticipacion.map((payment) => (
                          <tr key={payment.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-4 py-2 text-sm text-gray-900">{payment.dniUsuario}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">S/ {payment.monto.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{new Date(payment.fecha).toLocaleString('es-ES')}</td>
                            <td className="px-4 py-2 text-sm">
                              <a
                                href={payment.enlace}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Ver comprobante
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {report.pagosFueraDelFiltro.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pagos fuera del filtro aplicado</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-blue-100">
                      <thead className="bg-blue-50/60">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">DNI</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Monto</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Fecha</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Comprobante</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-blue-50">
                        {report.pagosFueraDelFiltro.map((payment) => (
                          <tr key={payment.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-4 py-2 text-sm text-gray-900">{payment.dniUsuario}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">S/ {payment.monto.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{new Date(payment.fecha).toLocaleString('es-ES')}</td>
                            <td className="px-4 py-2 text-sm">
                              <a
                                href={payment.enlace}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Ver comprobante
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {!loading && !report && !error && (
        <Card className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona una conferencia</h3>
          <p className="text-gray-600">Elige una conferencia y, opcionalmente, una región para visualizar el reporte.</p>
        </Card>
      )}
    </div>
  );
};
