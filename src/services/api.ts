import { AuthResponse, LoginRequest, Conference, User, Region, Participation, Payment, ConferenceRequest, UserRequest, ParticipationRequest } from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5078/api';


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

// Reports API
export const reportsApi = {
  getUsersTotal: async (): Promise<UsersTotalReport> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Reportes/usuarios-total`, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener reporte de usuarios totales');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users total report:', error);
      throw error;
    }
  },

  getParticipationsWithPayments: async (): Promise<ParticipationWithPayment[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Reportes/participaciones-con-pagos`, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener participaciones con pagos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching participations with payments:', error);
      throw error;
    }
  },

  getConferenceParticipants: async (conferenceId: string): Promise<ConferenceParticipantsReport> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Reportes/participaciones-con-pagos/conferencia/${conferenceId}`, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener participantes de conferencia');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching conference participants:', error);
      throw error;
    }
  },

  getParticipantsReport: async (): Promise<ParticipantsReport> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Reportes/participantes-conferencias`, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener reporte de participantes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching participants report:', error);
      throw error;
    }
  },

  getParticipantsByRegion: async (): Promise<ParticipantsByRegionReport[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Reportes/participantes-por-region`, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener participantes por región');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching participants by region:', error);
      throw error;
    }
  },

  getRegionParticipants: async (regionId: string): Promise<RegionParticipantsReport> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Reportes/participantes-por-region/${regionId}`, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener participantes de región');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching region participants:', error);
      throw error;
    }
  },

  getConferenceRegionParticipants: async (conferenceId: string): Promise<ConferenceRegionParticipantsReport> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Reportes/participantes-conferencia/${conferenceId}/por-region`, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener participantes de conferencia por región');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching conference region participants:', error);
      throw error;
    }
  },

  getUsersByRegion: async (regionId: string): Promise<User[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/Reportes/usuarios-por-region/${regionId}`, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener usuarios por región');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users by region:', error);
      throw error;
    }
  }
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