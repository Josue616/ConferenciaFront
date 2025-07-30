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
  password: string;
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
  dniUsuario: string;
  idConferencia: string;
  fecha: string;
  usuario: User;
  conferencia: Conference;
}

export interface Payment {
  id: string;
  dniUsuario: string;
  enlace: string;
  fecha: string;
  monto?: number;
  estado?: 'Pendiente' | 'Completado' | 'Cancelado';
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