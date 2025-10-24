import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ChevronDown, X } from 'lucide-react';
import { User as UserType, Region } from '../../types';
import { userSearchApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface UserSearchSelectProps {
  selectedUser: string;
  onUserSelect: (dni: string) => void;
  regions: Region[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const UserSearchSelect: React.FC<UserSearchSelectProps> = ({
  selectedUser,
  onUserSelect,
  regions,
  placeholder = "Buscar usuario...",
  required = false,
  disabled = false
}) => {
  const { user: currentUser, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState<UserType | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!selectedUser) {
      setSelectedUserData(null);
      setSearchTerm('');
      setSearchResults([]);
      setIsOpen(false);
    }
  }, [selectedUser]);

  // Para Encargados, usar su región automáticamente
  useEffect(() => {
    if (!isAdmin && currentUser) {
      // Buscar la región del usuario actual
      const userRegion = regions.find(r => r.nombres === currentUser.nombreRegion);
      if (userRegion) {
        setSelectedRegion(userRegion.id);
      }
    }
  }, [isAdmin, currentUser, regions]);

  // Buscar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (selectedUserData && searchTerm === selectedUserData.nombres) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    if (searchTerm.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
      }, 300);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, selectedRegion, selectedUserData]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      // Para Encargados, siempre incluir su región
      const regionToSearch = isAdmin ? selectedRegion : selectedRegion;
      const results = await userSearchApi.search(searchTerm, regionToSearch || undefined);
      setSearchResults(results);
      setIsOpen(true);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: UserType) => {
    setSelectedUserData(user);
    onUserSelect(user.dni);
    setSearchTerm(user.nombres);
    setIsOpen(false);
    setSearchResults([]);
  };

  const handleClear = () => {
    setSelectedUserData(null);
    onUserSelect('');
    setSearchTerm('');
    setSearchResults([]);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Usuario {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Region Selector - Solo para Admin */}
      {isAdmin && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Región (opcional)
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-sm"
            disabled={disabled}
          >
            <option value="">Todas las regiones</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>
                {region.nombres}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            disabled={disabled}
            required={required}
          />
          {selectedUserData && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={disabled}
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
          {!selectedUserData && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mr-2" />
              <span className="text-sm text-gray-600">Buscando...</span>
            </div>
          </div>
        )}

        {/* Search Results */}
        {isOpen && !loading && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((user) => (
              <button
                key={user.dni}
                type="button"
                onClick={() => handleUserSelect(user)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user.nombres}
                    </div>
                    <div className="text-xs text-gray-500">
                      DNI: {user.dni} • {user.region.nombres}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {isOpen && !loading && searchTerm.length >= 2 && searchResults.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <div className="text-center text-gray-500 text-sm">
              No se encontraron usuarios con "{searchTerm}"
            </div>
          </div>
        )}
      </div>

      {/* Selected User Info */}
      {selectedUserData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900">
                {selectedUserData.nombres}
              </div>
              <div className="text-xs text-blue-700">
                DNI: {selectedUserData.dni} • {selectedUserData.region.nombres} • {selectedUserData.rol}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Instructions */}
      {!isAdmin && (
        <div className="text-xs text-gray-500">
          Búsqueda limitada a usuarios de tu región: {currentUser?.nombreRegion}
        </div>
      )}
    </div>
  );
};