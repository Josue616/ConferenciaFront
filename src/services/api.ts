import { AuthResponse, LoginRequest, Conference, User, Region, Participation, Payment, ConferenceRequest, UserRequest, ParticipationRequest } from '../types';

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
  },

  delete: async (dni: string): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Usuarios/${dni}`, {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
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
  },

  create: async (nombres: string): Promise<Region> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Regiones`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombres })
      });

      if (!response.ok) {
        throw new Error('Error al crear región');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating region:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Regiones/${id}`, {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar región');
      }
    } catch (error) {
      console.error('Error deleting region:', error);
      throw error;
    }
  }
};

// User Search API
export const userSearchApi = {
  search: async (nombre: string, idRegion?: string): Promise<User[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      let url = `${API_BASE_URL}/Usuarios/buscar?nombre=${encodeURIComponent(nombre)}`;
      
      if (idRegion) {
        url += `&idRegion=${idRegion}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al buscar usuarios');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
};

// Participations API
export const participationsApi = {
  getAll: async (): Promise<Participation[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Participaciones`, {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener participaciones');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching participations:', error);
      throw error;
    }
  },

  getByUser: async (dni: string): Promise<Participation[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Participaciones/usuario/${dni}`, {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener participaciones del usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user participations:', error);
      throw error;
    }
  },

  getByRegion: async (regionId: string): Promise<Participation[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Participaciones/region/${regionId}`, {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener participaciones de la región');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching region participations:', error);
      throw error;
    }
  },

  getByConference: async (conferenceId: string): Promise<Participation[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Participaciones/conferencia/${conferenceId}`, {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener participaciones de la conferencia');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching conference participations:', error);
      throw error;
    }
  },

  create: async (participation: ParticipationRequest): Promise<Participation> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Participaciones`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(participation)
      });

      if (!response.ok) {
        throw new Error('Error al crear participación');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating participation:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Participaciones/${id}`, {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar participación');
      }
    } catch (error) {
      console.error('Error deleting participation:', error);
      throw error;
    }
  }
};

// CSV Export utilities
export const csvExportApi = {
  exportParticipations: async (): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Get all participations
      const participations = await participationsApi.getAll();
      
      // Get detailed user info for each participation
      const participationsWithDetails = await Promise.all(
        participations.map(async (participation) => {
          try {
            const userResponse = await fetch(`${API_BASE_URL}/Usuarios/${participation.dniUsuario}`, {
              headers: {
                'accept': 'text/plain',
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              return {
                ...participation,
                userDetails: userData
              };
            } else {
              return {
                ...participation,
                userDetails: null
              };
            }
          } catch (error) {
            console.error(`Error fetching user ${participation.dniUsuario}:`, error);
            return {
              ...participation,
              userDetails: null
            };
          }
        })
      );
      
      // Generate CSV content
      const csvContent = generateParticipationsCSV(participationsWithDetails);
      
      // Download CSV file
      downloadCSV(csvContent, 'participaciones_completo.csv');
      
    } catch (error) {
      console.error('Error exporting participations:', error);
      throw error;
    }
  }
};

const generateParticipationsCSV = (participations: any[]): string => {
  // CSV Headers
  const headers = [
    'ID Participación',
    'DNI Usuario',
    'Nombre Completo',
    'Sexo',
    'Fecha Nacimiento',
    'Teléfono',
    'Rol Usuario',
    'Región Usuario',
    'ID Conferencia',
    'Nombre Conferencia',
    'Fecha Inscripción',
    'Hora Inscripción'
  ];
  
  // Generate CSV rows
  const rows = participations.map(participation => {
    const user = participation.userDetails;
    const fechaInscripcion = new Date(participation.fecha);
    
    return [
      participation.id,
      participation.dniUsuario,
      participation.nombreUsuario,
      user ? (user.sexo ? 'Masculino' : 'Femenino') : 'N/A',
      user ? new Date(user.fechaNacimiento).toLocaleDateString('es-ES') : 'N/A',
      user ? user.telefono : 'N/A',
      user ? user.rol : 'N/A',
      user ? user.region.nombres : 'N/A',
      participation.idConferencia,
      participation.nombreConferencia,
      fechaInscripcion.toLocaleDateString('es-ES'),
      fechaInscripcion.toLocaleTimeString('es-ES')
    ];
  });
  
  // Combine headers and rows
  const csvData = [headers, ...rows];
  
  // Convert to CSV string
  return csvData.map(row => 
    row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
};

const downloadCSV = (csvContent: string, filename: string): void => {
  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

// Payments API
export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Pagos`, {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener pagos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  getByUser: async (dni: string): Promise<Payment[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Pagos/usuario/${dni}`, {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener pagos del usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user payments:', error);
      throw error;
    }
  },

  getByRegion: async (regionId: string): Promise<Payment[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Pagos/region/${regionId}`, {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener pagos de la región');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching region payments:', error);
      throw error;
    }
  },

  create: async (dniUsuario: string, idConferencia: string, enlace: string): Promise<Payment> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Pagos`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dniUsuario,
          idConferencia,
          enlace
        })
      });

      if (!response.ok) {
        throw new Error('Error al registrar el pago');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Pagos/${id}`, {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el pago');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }
};