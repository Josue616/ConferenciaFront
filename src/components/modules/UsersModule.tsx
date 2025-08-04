import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Calendar, MapPin, Plus, Edit, UserPlus, AlertCircle, User as UserIcon, UserX, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Pagination } from '../ui/Pagination';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { User, Region, UserRequest } from '../../types';
import { usersApi, regionsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateForInput, formatDateForDisplay } from '../../utils/dateUtils';

const ITEMS_PER_PAGE = 10;

export const UsersModule: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserRequest>({
    dni: '',
    nombres: '',
    sexo: true,
    fechaNacimiento: '',
    telefono: '',
    rol: 'Oyente',
    password: null,
    idRegion: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError('');
      const [usersData, regionsData] = await Promise.all([
        usersApi.getAll(),
        regionsApi.getAll()
      ]);
      setUsers(usersData);
      setRegions(regionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.dni.includes(searchTerm);
    const matchesRole = !selectedRole || user.rol === selectedRole;
    const matchesRegion = !selectedRegion || user.idRegion === selectedRegion;
    return matchesSearch && matchesRole && matchesRegion;
  });

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedRegion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      // Preparar los datos según el rol
      const submitData = {
        ...formData,
        password: formData.rol === 'Oyente' ? null : formData.password
      };

      if (editingUser) {
        const { dni, ...updateData } = submitData;
        await usersApi.update(editingUser.dni, updateData);
      } else {
        await usersApi.create(submitData);
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Error al guardar el usuario. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      dni: user.dni,
      nombres: user.nombres,
      sexo: user.sexo,
      fechaNacimiento: formatDateForInput(user.fechaNacimiento),
      telefono: user.telefono,
      rol: user.rol,
      password: user.password || null,
      idRegion: user.idRegion
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setError('');
    setFormData({
      dni: '',
      nombres: '',
      sexo: true,
      fechaNacimiento: '',
      telefono: '',
      rol: 'Oyente',
      password: null,
      idRegion: ''
    });
  };

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      await usersApi.delete(deletingUser.dni);
      await loadData();
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Error al eliminar el usuario. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeletingUser(null);
  };

  const getRoleBadgeVariant = (rol: string) => {
    switch (rol) {
      case 'Admin': return 'primary';
      case 'Encargado': return 'success';
      case 'Oyente': return 'secondary';
      default: return 'secondary';
    }
  };

  const getAvailableRoles = () => {
    if (isAdmin) {
      return ['Encargado', 'Oyente'];
    }
    return ['Oyente'];
  };

  const getUserIcon = (sexo: boolean) => {
    return sexo ? (
      <UserIcon className="w-5 h-5 text-blue-600" />
    ) : (
      <UserX className="w-5 h-5 text-pink-600" />
    );
  };

  const getUserIconBg = (sexo: boolean) => {
    return sexo ? 'bg-blue-100' : 'bg-pink-100';
  };

  const isPasswordRequired = formData.rol !== 'Oyente';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600">Gestiona los usuarios del sistema</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
          Nuevo Usuario
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Buscar por nombre o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>
          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
            >
              <option value="">Todos los roles</option>
              <option value="Admin">Admin</option>
              <option value="Encargado">Encargado</option>
              <option value="Oyente">Oyente</option>
            </select>
          </div>
          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
            >
              <option value="">Todas las regiones</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>
                  {region.nombres}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>




      {/* Users Tables - Stacked Layout */}
      <div className="space-y-6">
        {/* Usuarios Masculinos */}
        <Card padding="sm">
          <div className="mb-4 flex items-center space-x-2">
            <UserIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Usuarios Masculinos</h3>
            <Badge variant="primary">
              {filteredUsers.filter(u => u.sexo).length}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Región
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Nac.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Edad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grupo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.filter(user => user.sexo).slice(startIndex, startIndex + ITEMS_PER_PAGE).map((user) => (
                  <tr key={user.dni} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.nombres}
                          </div>
                          <div className="text-sm text-gray-500">
                            Masculino
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.dni}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {user.telefono}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {user.region.nombres}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getRoleBadgeVariant(user.rol)}>
                        {user.rol}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDateForDisplay(user.fechaNacimiento)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {user.edad} años
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={
                        user.grupoEdad === 'Infante' ? 'warning' :
                        user.grupoEdad === 'Niño' ? 'primary' :
                        user.grupoEdad === 'Adulto' ? 'success' : 'secondary'
                      }>
                        {user.grupoEdad}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {(isAdmin || user.rol === 'Oyente') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-700"
                          />
                        )}
                        {isAdmin && user.rol !== 'Admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600 hover:text-red-700"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Usuarios Femeninos */}
        <Card padding="sm">
          <div className="mb-4 flex items-center space-x-2">
            <UserX className="w-5 h-5 text-pink-600" />
            <h3 className="text-lg font-semibold text-gray-900">Usuarios Femeninos</h3>
            <Badge variant="secondary">
              {filteredUsers.filter(u => !u.sexo).length}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Región
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Nac.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Edad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grupo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.filter(user => !user.sexo).slice(startIndex, startIndex + ITEMS_PER_PAGE).map((user) => (
                  <tr key={user.dni} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <UserX className="w-5 h-5 text-pink-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.nombres}
                          </div>
                          <div className="text-sm text-gray-500">
                            Femenino
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.dni}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {user.telefono}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {user.region.nombres}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getRoleBadgeVariant(user.rol)}>
                        {user.rol}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDateForDisplay(user.fechaNacimiento)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {user.edad} años
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={
                        user.grupoEdad === 'Infante' ? 'warning' :
                        user.grupoEdad === 'Niño' ? 'primary' :
                        user.grupoEdad === 'Adulto' ? 'success' : 'secondary'
                      }>
                        {user.grupoEdad}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {(isAdmin || user.rol === 'Oyente') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-700"
                          />
                        )}
                        {isAdmin && user.rol !== 'Admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600 hover:text-red-700"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Pagination */}
      <Card padding="sm">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredUsers.length}
        />
      </Card>

      {/* Single table - removed */}
      {false && <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DNI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Región
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Nac.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.dni} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${getUserIconBg(user.sexo)} rounded-full flex items-center justify-center`}>
                        {getUserIcon(user.sexo)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.nombres}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.sexo ? 'Masculino' : 'Femenino'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.dni}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {user.telefono}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {user.region.nombres}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getRoleBadgeVariant(user.rol)}>
                      {user.rol}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDateForDisplay(user.fechaNacimiento)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {user.edad} años
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {(isAdmin || user.rol === 'Oyente') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-700"
                        />
                      )}
                      {isAdmin && user.rol !== 'Admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-600 hover:text-red-700"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>}

      {filteredUsers.length === 0 && !loading && (
        <Card className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron usuarios
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedRole || selectedRegion ? 'Intenta ajustar los filtros de búsqueda' : 'No hay usuarios registrados'}
          </p>
        </Card>
      )}

      {/* User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editingUser && (
              <Input
                label="DNI"
                value={formData.dni}
                onChange={(e) => setFormData(prev => ({ ...prev, dni: e.target.value }))}
                placeholder="Número de DNI"
                required
              />
            )}
            
            <Input
              label="Nombres completos"
              value={formData.nombres}
              onChange={(e) => setFormData(prev => ({ ...prev, nombres: e.target.value }))}
              placeholder="Nombres y apellidos"
              required
              className={!editingUser ? 'md:col-span-1' : 'md:col-span-2'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexo <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sexo ? 'true' : 'false'}
                onChange={(e) => setFormData(prev => ({ ...prev, sexo: e.target.value === 'true' }))}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                required
              >
                <option value="true">Masculino</option>
                <option value="false">Femenino</option>
              </select>
            </div>

            <Input
              label="Fecha de nacimiento"
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) => setFormData(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
              placeholder="Número de teléfono"
              required
            />

            <Input
              label="Contraseña"
              type="password"
              value={formData.password || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value || null }))}
              placeholder={isPasswordRequired ? "Contraseña del usuario" : "Sin contraseña (Oyente)"}
              required={isPasswordRequired}
              disabled={!isPasswordRequired}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.rol}
                onChange={(e) => {
                  const newRole = e.target.value as 'Admin' | 'Encargado' | 'Oyente';
                  setFormData(prev => ({ 
                    ...prev, 
                    rol: newRole,
                    password: newRole === 'Oyente' ? null : prev.password
                  }));
                }}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                required
              >
                {getAvailableRoles().map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Región <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.idRegion}
                onChange={(e) => setFormData(prev => ({ ...prev, idRegion: e.target.value }))}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                required
              >
                <option value="">Seleccionar región</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.nombres}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password Info */}
          {formData.rol === 'Oyente' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-700">
                  Los usuarios con rol "Oyente" no requieren contraseña para el sistema.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleCloseModal}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              loading={submitting}
              disabled={submitting}
              icon={editingUser ? Edit : UserPlus}
              className="w-full sm:w-auto"
            >
              {editingUser ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Usuario"
        message={
          deletingUser 
            ? `¿Estás seguro de que deseas eliminar al usuario "${deletingUser.nombres}" (DNI: ${deletingUser.dni})? Esta acción no se puede deshacer.`
            : "¿Estás seguro de que deseas eliminar este usuario?"
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={submitting}
      />
    </div>
  );
};