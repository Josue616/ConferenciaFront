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

export interface UserRequest {
  dni?: string; // Solo para crear, no para editar
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
  fecha: string;
}

export interface ParticipationRequest {
  dniUsuario: string;
  idConferencia: string;
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