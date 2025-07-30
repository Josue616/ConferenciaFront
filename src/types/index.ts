export interface User {
  dni: string;
  nombres: string;
  sexo: boolean;
  fechaNacimiento: string;
  telefono: string;
  rol: 'Admin' | 'Encargado' | 'Oyente';
  region: {
    id: string;
    nombres: string;
  };
  pagos?: Payment[];
}

export interface Region {
  id: string;
  nombres: string;
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