export interface User {
  dni: string;
  nombres: string;
  sexo: boolean;
  fechaNacimiento: string;
  telefono: string;
  rol: 'Admin' | 'Encargado' | 'Oyente';
  password?: string;
  idRegion: string;
  edad: number;
  grupoEdad: string;
  region: {
    id: string;
    nombres: string;
  };
  participaciones?: Participation[];
  pagos?: Payment[];
}

// Petición para crear usuario (requiere dni inicial)
export interface UserRequest {
  dni: string; // Para creación
  nombres: string;
  sexo: boolean;
  fechaNacimiento: string;
  telefono: string;
  rol: 'Admin' | 'Encargado' | 'Oyente';
  password: string | null;
  idRegion: string;
}

// Petición para actualizar usuario (se pasa dni actual en la ruta y nuevoDni en el cuerpo)
export interface UserUpdateRequest {
  nuevoDni: string; // Si no cambia, enviar el mismo dni actual
  nombres: string;
  sexo: boolean;
  fechaNacimiento: string;
  telefono: string;
  rol: 'Admin' | 'Encargado' | 'Oyente';
  password: string | null;
  idRegion: string;
}

export interface Region {
  id: string;
  nombres: string;
  conferencias?: Conference[];
}

export interface Conference {
  id: string;
  nombres: string;
  idRegion: string;
  nombreRegion: string;
  fechaInicio: string;
  fechaFin: string;
  fechaFinIns: string;
  capacidad: number;
  montoIns: number;
  participantesInscritos: number;
  estaVigente: boolean;
}

export interface Participation {
  id: string;
  dniUsuario: string;
  nombreUsuario: string;
  idConferencia: string;
  nombreConferencia: string;
  servicio: string;
  fecha: string;
  almuerzo?: boolean | null;
  cena?: boolean | null;
}

export interface ParticipationRequest {
  dniUsuario: string;
  idConferencia: string;
  servicio: string;
  almuerzo: boolean;
  cena: boolean;
}

export interface Payment {
  id: string;
  dniUsuario: string;
  nombreUsuario: string;
  idConferencia: string;
  nombreConferencia: string;
  enlace: string;
  monto: number;
  fecha: string;
}

export interface AuthResponse {
  token: string;
  dni: string;
  nombres: string;
  rol: 'Admin' | 'Encargado';
  nombreRegion: string;
}

export interface LoginRequest {
  dni: string;
  password: string;
}

export interface ConferenceRequest {
  nombres: string;
  idRegion: string;
  fechaInicio: string;
  fechaFin: string;
  fechaFinIns: string;
  capacidad: number;
  montoIns: number;
}

// Reports Types
export interface UsersTotalReport {
  totalGeneral: number;
  porRegion: {
    idRegion: string;
    nombreRegion: string;
    cantidadUsuarios: number;
  }[];
}

export interface ParticipationWithPayment {
  idParticipacion: string;
  dniUsuario: string;
  nombreUsuario: string;
  idConferencia: string;
  nombreConferencia: string;
  regionConferencia: string;
  fechaParticipacion: string;
  tienePago: boolean;
}

export interface ConferenceParticipantsReport {
  conferencia: {
    id: string;
    nombre: string;
    region: string;
  };
  totalParticipantes: number;
  conPago: number;
  sinPago: number;
  participantes: {
    idParticipacion: string;
    dniUsuario: string;
    nombreUsuario: string;
    fechaParticipacion: string;
    tienePago: boolean;
  }[];
}

export interface ParticipantsReport {
  totalParticipantesUnicos: number;
  totalParticipaciones: number;
  participantes: {
    dniUsuario: string;
    nombreUsuario: string;
    regionUsuario: string;
    totalParticipaciones: number;
    conferencias: {
      idConferencia: string;
      nombreConferencia: string;
      regionConferencia: string;
      fechaParticipacion: string;
    }[];
  }[];
}

export interface ParticipantsByRegionReport {
  idRegion: string;
  nombreRegion: string;
  totalParticipantesUnicos: number;
  totalParticipaciones: number;
  participantes: {
    dniUsuario: string;
    nombreUsuario: string;
    totalParticipaciones: number;
    conferencias: {
      idConferencia: string;
      nombreConferencia: string;
      fechaParticipacion: string;
    }[];
  }[];
}

export interface RegionParticipantsReport {
  region: {
    id: string;
    nombre: string;
  };
  totalParticipantesUnicos: number;
  totalParticipaciones: number;
  participantes: {
    dniUsuario: string;
    nombreUsuario: string;
    totalParticipaciones: number;
    conferencias: {
      idConferencia: string;
      nombreConferencia: string;
      regionConferencia: string;
      fechaParticipacion: string;
    }[];
  }[];
}

export interface ConferenceRegionParticipantsReport {
  conferencia: {
    id: string;
    nombre: string;
    region: string;
  };
  totalParticipantes: number;
  participantesPorRegion: {
    idRegion: string;
    nombreRegion: string;
    cantidadParticipantes: number;
    participantes: {
      dniUsuario: string;
      nombreUsuario: string;
      fechaParticipacion: string;
    }[];
  }[];
}

export interface ConferenceFinancialReport {
  conferencia: {
    id: string;
    nombres: string;
    idRegion: string;
    regionConferencia: string;
    fechaInicio: string;
    fechaFin: string;
    fechaFinIns: string;
    capacidad: number;
    montoIns: number;
    totalEsperadoCapacidad: number;
    totalPagadoConferencia: number;
    diferenciaCapacidad: number;
    participantesRegistrados: number;
    capacidadDisponible: number;
  };
  filtros: {
    regionId: string | null;
    regionNombre: string | null;
  };
  resumenParticipantes: {
    totalParticipantes: number;
    montoEsperado: number;
    montoPagado: number;
    diferencia: number;
  };
  regiones: ConferenceFinancialRegionReport[];
  pagosSinParticipacion: ConferenceFinancialPaymentRecord[];
  pagosFueraDelFiltro: ConferenceFinancialPaymentRecord[];
}

export interface ConferenceFinancialRegionReport {
  regionId: string;
  regionNombre: string;
  totalParticipantes: number;
  montoEsperado: number;
  montoPagado: number;
  diferencia: number;
  participantes: ConferenceFinancialParticipant[];
}

export interface ConferenceFinancialParticipant {
  dniUsuario: string;
  nombreUsuario: string;
  regionId: string;
  regionNombre: string;
  fechaRegistro: string;
  servicio: string;
  incluyeAlmuerzo: boolean;
  incluyeCena: boolean;
  montoEsperado: number;
  totalPagado: number;
  diferencia: number;
  pagos: ConferenceFinancialPayment[];
}

export interface ConferenceFinancialPayment {
  id: string;
  monto: number;
  fecha: string;
  enlace: string;
}

export interface ConferenceFinancialPaymentRecord {
  id: string;
  dniUsuario: string;
  monto: number;
  fecha: string;
  enlace: string;
}

// Pagos - Participantes faltantes de pago para la próxima conferencia
export interface NextConferenceMissingPaymentParticipant {
  dniUsuario: string;
  nombreUsuario: string;
  idConferencia: string;
  nombreConferencia: string;
  servicio: string;
}

// Inversores
export interface Inversor {
  id: string;
  nombre: string;
  idRegion: string;
  nombreRegion?: string;
  montoMensualCuota: number;
  currencyCuota: number | string; // 0: Dolares, 1: Soles, 2: Euros o "Dolares", "Soles", "Euros"
  region?: {
    id: string;
    nombres: string;
  };
}

export interface InversorRequest {
  nombre: string;
  idRegion: string;
  montoMensualCuota: number;
  currencyCuota: number | string; // 0: Dolares, 1: Soles, 2: Euros o "Dolares", "Soles", "Euros"
}

export interface PagoInversor {
  id: string;
  codigo?: string; // "INV" o "MIC"
  serie?: string; // Formato: 0000MMCC
  monto: number;
  currency: number | string; // 0: Dolares, 1: Soles, 2: Euros or string
  idTipo: string;
  idInversor: string;
  nombreInversor?: string;
  esMicroinversionista?: boolean;
  fechaCreacion: string;
  tipo?: {
    id: string;
    esMicroinversionista: boolean;
  };
  inversor?: {
    id: string;
    nombre: string;
  };
}

export interface PagoInversorRequest {
  idInversor: string;
  monto: number;
  currency: number; // 0: Dolares, 1: Soles, 2: Euros
  idTipo: string;
}

export interface Tipo {
  id: string;
  esMicroinversionista: boolean;
}

export interface ReporteInversorDto {
  inversorId: string;
  nombreInversor: string;
  nombreRegion: string;
  numeroPagosMicroinversionista: number;
  pagosMicroinversionista: {
    pagoId: string;
    monto: number;
    currency: string;
    fechaCreacion: string;
  }[];
  numeroPagosInversionista: number;
  pagosInversionista: {
    pagoId: string;
    monto: number;
    currency: string;
    fechaCreacion: string;
  }[];
  totalSoles: number;
  totalDolares: number;
  totalEuros: number;
  montoEsperadoSoles: number;
  montoEsperadoDolares: number;
  diferenciaSoles: number;
  diferenciaDolares: number;
  porcentajeCumplimientoSoles: number;
  porcentajeCumplimientoDolares: number;
  estado: string;
}

export interface ReporteGeneralDto {
  mes: number;
  anio: number;
  tipoFiltro: string;
  totalSoles: number;
  totalDolares: number;
  totalEuros: number;
  totalSolesMesAnterior: number;
  totalDolaresMesAnterior: number;
  totalEurosMesAnterior: number;
  porcentajeCambioSoles: number | null;
  porcentajeCambioDolares: number | null;
  porcentajeCambioEuros: number | null;
}

// Gastos
export interface Gasto {
  id: string;
  monto: number;
  currency: number | string; // 0: Dólares, 1: Soles, 2: Euros o "Dolares", "Soles", "Euros"
  categoria: number | string; // Enum id (0..8) o etiqueta (string)
  descripcion: string;
  fecha: string;
}

export interface GastoRequest {
  monto: number;
  currency: number | string;
  categoria: number | string;
  descripcion: string;
}

export interface TotalesGastosDto {
  totalSoles: number;
  totalDolares: number;
  totalEuros: number;
  totalConvertidoSoles: number;
  gastosPorCategoria: {
    categoria: string;
    montoTotal: number;
    numeroTransacciones: number;
    porcentajeDelTotal: number;
  }[];
  gastosPorMes: {
    mes: number;
    anio: number;
    nombreMes: string;
    montoTotal: number;
    numeroTransacciones: number;
  }[];
  gastosPorDivisa: {
    divisa: string;
    montoTotal: number;
    montoConvertidoSoles: number;
    numeroTransacciones: number;
    porcentajeDelTotal: number;
  }[];
  totalTransacciones: number;
  fechaPrimerGasto: string;
  fechaUltimoGasto: string;
}

export interface ReporteGastosIngresosDto {
  mes?: number;
  anio?: number;
  totalIngresosSoles: number;
  totalIngresosDolares: number;
  totalIngresosConvertidoSoles: number;
  totalGastosSoles: number;
  totalGastosDolares: number;
  totalGastosConvertidoSoles: number;
  balanceSoles: number;
  balanceDolares: number;
  balanceTotalSoles: number;
  gastosPorCategoria: {
    categoria: string;
    montoSoles: number;
    montoDolares: number;
    montoTotalSoles: number;
    numeroTransacciones: number;
  }[];
  detalleIngresos: {
    tipoInversor: string;
    montoSoles: number;
    montoDolares: number;
    numeroPagos: number;
  }[];
  estadoFinanciero: string;
  alertaConsumoSoles: string;
  // Campos adicionales para reporte global
  fechaPrimerIngreso?: string;
  fechaUltimoIngreso?: string;
  fechaPrimerGasto?: string;
  fechaUltimoGasto?: string;
  totalMesesConIngresos?: number;
  totalMesesConGastos?: number;
  totalTransaccionesIngresos?: number;
  totalTransaccionesGastos?: number;
  promedioIngresosMensualSoles?: number;
  promedioGastosMensualSoles?: number;
}
