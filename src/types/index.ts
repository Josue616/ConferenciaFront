export interface User {
  dni: string;
  nombres: string;
  sexo: boolean;
  fechaNacimiento: string;
  telefono: string;
  rol: 'Admin' | 'Encargado' | 'Oyente';
  password?: string;
  idRegion: string;
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
  participantesInscritos: number;
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
  enlace: string;
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
}