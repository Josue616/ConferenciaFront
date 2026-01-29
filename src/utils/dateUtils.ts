/**
 * Convierte una fecha de la API a formato YYYY-MM-DD para input[type="date"]
 * La API devuelve fechas en formato ISO (YYYY-MM-DD) pero sin zona horaria
 */
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  // Solo tomar la parte de la fecha (YYYY-MM-DD) sin procesar con Date
  return dateString.split('T')[0];
};

/**
 * Convierte una fecha de input[type="date"] a formato para mostrar
 * Evita problemas de zona horaria manteniendo la fecha local
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  // Crear fecha directamente sin usar el constructor Date que puede cambiar la zona horaria
  const dateParts = dateString.split('-');
  if (dateParts.length !== 3) return dateString;
  
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1; // Los meses en Date van de 0-11
  const day = parseInt(dateParts[2]);
  
  const date = new Date(year, month, day);
  
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Convierte una fecha para enviar a la API
 * Mantiene el formato YYYY-MM-DD sin cambios de zona horaria
 */
export const formatDateForAPI = (dateString: string): string => {
  if (!dateString) return '';
  return dateString; // Los inputs date ya están en formato YYYY-MM-DD
};

/**
 * Formatea una fecha ISO para mostrar en formato local
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
