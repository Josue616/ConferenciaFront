import { AuthResponse, LoginRequest, Conference, User, Region, Participation, Payment, ConferenceRequest, UserRequest } from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5078/api';

const mockConferences: Conference[] = [
  {
    id: '339ce11a-68aa-4580-975c-3a138ddc5e79',
    nombres: 'Conferencia de Tecnología Lima 2025',
    idRegion: '44e2846d-0e56-4aca-88ca-1b02bd66c2e3',
    nombreRegion: 'Lima',
    fechaInicio: '2025-08-15',
    fechaFin: '2025-08-17',
    fechaFinIns: '2025-08-10',
    capacidad: 100,
    participantesInscritos: 2
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    nombres: 'Simposio Empresarial Arequipa',
    idRegion: 'bf941000-4cb1-472e-b011-08759990654c',
    nombreRegion: 'Arequipa',
    fechaInicio: '2025-09-10',
    fechaFin: '2025-09-12',
    fechaFinIns: '2025-09-05',
    capacidad: 80,
    participantesInscritos: 1
  },
  {
    id: 'f9e8d7c6-b5a4-3210-9876-543210fedcba',
    nombres: 'Congreso de Innovación Cusco',
    idRegion: '7f8e5d2a-3b4c-4a5d-8e2f-1a2b3c4d5e6f',
    nombreRegion: 'Cusco',
    fechaInicio: '2025-10-20',
    fechaFin: '2025-10-22',
    fechaFinIns: '2025-10-15',
    capacidad: 60,
    participantesInscritos: 0
  }
];

const mockUsers: User[] = [
  {
    dni: '11223344',
    nombres: 'María González López',
    sexo: false,
    fechaNacimiento: '1992-07-22',
    telefono: '923456789',
    rol: 'Oyente',
    password: null,
    idRegion: 'd813ab73-57eb-4772-a295-22fde6a065a8',
    region: {
      id: 'd813ab73-57eb-4772-a295-22fde6a065a8',
      nombres: 'Cusco',
      conferencias: []
    },
    participaciones: [],
    pagos: []
  },
  {
    dni: '99887766',
    nombres: 'Carlos Rodríguez Mendoza',
    sexo: true,
    fechaNacimiento: '1988-11-08',
    telefono: '934567890',
    rol: 'Oyente',
    password: null,
    idRegion: '44e2846d-0e56-4aca-88ca-1b02bd66c2e3',
    region: {
      id: '44e2846d-0e56-4aca-88ca-1b02bd66c2e3',
      nombres: 'Lima',
      conferencias: []
    },
    participaciones: [],
    pagos: []
  }
];

const mockParticipations: Participation[] = [
  {
    dniUsuario: '11223344',
    idConferencia: '339ce11a-68aa-4580-975c-3a138ddc5e79',
    fecha: '2025-01-15T10:30:00.000Z',
    usuario: mockUsers[0],
    conferencia: mockConferences[0]
  },
  {
    dniUsuario: '99887766',
    idConferencia: '339ce11a-68aa-4580-975c-3a138ddc5e79',
    fecha: '2025-01-16T14:20:00.000Z',
    usuario: mockUsers[1],
    conferencia: mockConferences[0]
  },
  {
    dniUsuario: '11223344',
    idConferencia: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    fecha: '2025-01-18T09:15:00.000Z',
    usuario: mockUsers[0],
    conferencia: mockConferences[1]
  }
];

const mockPayments: Payment[] = [
  {
    id: 'pay-001',
    dniUsuario: '11223344',
    enlace: 'https://payment-gateway.com/pay/12345',
    fecha: '2025-01-15T10:30:00.000Z',
    monto: 150.00,
    estado: 'Completado'
  },
  {
    id: 'pay-002',
    dniUsuario: '99887766',
    enlace: 'https://payment-gateway.com/pay/67890',
    fecha: '2025-01-16T14:20:00.000Z',
    monto: 150.00,
    estado: 'Pendiente'
  },
  {
    id: 'pay-003',
    dniUsuario: '11223344',
    enlace: 'https://payment-gateway.com/pay/54321',
    fecha: '2025-01-18T09:15:00.000Z',
    monto: 200.00,
    estado: 'Completado'
  }
];

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'text/plain'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Credenciales inválidas');
        }
        throw new Error('Error de servidor');
      }

      const data: AuthResponse = await response.json();
      
      // Verificar que el usuario tenga permisos (solo Admin o Encargado)
      if (data.rol !== 'Admin' && data.rol !== 'Encargado') {
        throw new Error('Sin permisos de acceso');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión');
    }
  }
};

// Conferences API
export const conferencesApi = {
  getAll: async (): Promise<Conference[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Conferencias`, {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener conferencias');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching conferences:', error);
      throw error;
    }
  },

  create: async (conference: ConferenceRequest): Promise<Conference> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Conferencias`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(conference)
      });

      if (!response.ok) {
        throw new Error('Error al crear conferencia');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating conference:', error);
      throw error;
    }
  },

  update: async (id: string, conference: ConferenceRequest): Promise<Conference> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Conferencias/${id}`, {
        method: 'PUT',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(conference)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar conferencia');
      }

      // La API PUT podría no devolver el objeto actualizado, así que lo construimos
      const regions = await regionsApi.getAll();
      const region = regions.find(r => r.id === conference.idRegion);
      
      return {
        id,
        ...conference,
        nombreRegion: region?.nombres || 'Desconocida',
        participantesInscritos: 0 // Este valor debería venir de la API real
      };
    } catch (error) {
      console.error('Error updating conference:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Conferencias/${id}`, {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar conferencia');
      }
    } catch (error) {
      console.error('Error deleting conference:', error);
      throw error;
    }
  }
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Usuarios`, {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  create: async (user: UserRequest): Promise<User> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Usuarios`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        throw new Error('Error al crear usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  update: async (dni: string, user: Omit<UserRequest, 'dni'>): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Usuarios/${dni}`, {
        method: 'PUT',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar usuario');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};

// Regions API
export const regionsApi = {
  getAll: async (): Promise<Region[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Regiones`, {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener regiones');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  }
};

// Participations API
export const participationsApi = {
  getAll: async (): Promise<Participation[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockParticipations];
  }
};

// Payments API
export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockPayments];
  }
};