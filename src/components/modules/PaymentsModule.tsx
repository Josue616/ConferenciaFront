import React, { useState, useEffect } from 'react';
import { CreditCard, Search, ExternalLink, Calendar, Upload, User, MapPin, Plus, Image, CheckCircle, AlertCircle, Eye, Trash2, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Pagination } from '../ui/Pagination';
import { Payment, User as UserType, Region } from '../../types';
import { paymentsApi, regionsApi, conferencesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { UserSearchSelect } from '../ui/UserSearchSelect';

const ITEMS_PER_PAGE = 10;

// Cloudinary upload function
const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'default_preset');

  const response = await fetch('https://api.cloudinary.com/v1_1/dfvrzr6ib/image/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Error al subir la imagen');
  }

  const data = await response.json();
  return data.secure_url;
};

export const PaymentsModule: React.FC = () => {
  const { isAdmin } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedConference, setSelectedConference] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError('');
      
      // Load payments
      const paymentsData = await paymentsApi.getAll();
      setPayments(paymentsData);
      
      // Load conferences
      const conferencesData = await conferencesApi.getAll();
      setConferences(conferencesData);
      
      // Load regions
      const regionsData = await regionsApi.getAll();
      setRegions(regionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.dniUsuario.includes(searchTerm);
    
    // Note: Region filtering would need additional API support to get user region from payment
    const matchesRegion = !selectedRegion; // For now, show all when region filter is applied
    
    return matchesSearch && matchesRegion;
  });

  // Paginación
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRegion]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileProcess(file);
  };

  const handleFileProcess = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadedImageUrl('');
      setUploadSuccess(false);
    } else if (file) {
      setError('Por favor selecciona un archivo de imagen válido.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleUploadAndRegister = async () => {
    if (!selectedFile || !selectedUser || !selectedConference) return;
    
    setUploading(true);
    setError('');
    
    try {
      // Step 1: Upload image to Cloudinary
      const imageUrl = await uploadImageToCloudinary(selectedFile);
      setUploadedImageUrl(imageUrl);
      
      // Step 2: Register payment in API
      await paymentsApi.create(selectedUser, selectedConference, imageUrl);
      
      setUploadSuccess(true);
      await loadData(); // Reload payments
      
      // Reset form after success
      setTimeout(() => {
        handleCloseUploadModal();
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading and registering payment:', error);
      setError('Error al procesar el pago. Por favor, intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleViewImage = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageModalOpen(true);
  };

  const handleDelete = (payment: Payment) => {
    setPaymentToDelete(payment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!paymentToDelete) return;
    
    setDeleting(true);
    setError('');
    
    try {
      await paymentsApi.delete(paymentToDelete.id);
      await loadData();
      setIsDeleteDialogOpen(false);
      setPaymentToDelete(null);
    } catch (error) {
      console.error('Error deleting payment:', error);
      setError('Error al eliminar el pago. Por favor, intenta nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedUser('');
    setSelectedConference('');
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadedImageUrl('');
    setUploadSuccess(false);
    setError('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url) || 
           url.includes('cloudinary.com') || 
           url.includes('res.cloudinary.com');
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
          <p className="text-gray-600">Gestiona los pagos y comprobantes del sistema</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} icon={Plus}>
          Registrar Pago
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Buscar por usuario o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>
          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
              disabled={!isAdmin}
            >
              <option value="">{isAdmin ? 'Todas las regiones' : 'Mi región'}</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>
                  {region.nombres}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conferencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comprobante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.nombreUsuario}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {payment.dniUsuario}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {payment.nombreConferencia}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {payment.idConferencia.slice(-8)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(payment.fecha)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isImageUrl(payment.enlace) ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        onClick={() => handleViewImage(payment.enlace)}
                      >
                        Ver Imagen
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={ExternalLink}
                        onClick={() => window.open(payment.enlace, '_blank')}
                      >
                        Ver Enlace
                      </Button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDelete(payment)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredPayments.length}
        />
      </Card>

      {filteredPayments.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron pagos
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedRegion ? 'Intenta ajustar los filtros de búsqueda' : 'No hay pagos registrados'}
          </p>
        </Card>
      )}

      {/* Upload Payment Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        title="Registrar Nuevo Pago"
        size="lg"
      >
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {uploadSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="text-sm font-medium text-green-800">¡Pago registrado exitosamente!</h3>
                <p className="text-sm text-green-700 mt-1">El comprobante ha sido subido y el pago registrado.</p>
              </div>
            </div>
          )}

          {!uploadSuccess && (
            <>
              {/* User Selection */}
              <UserSearchSelect
                selectedUser={selectedUser}
                onUserSelect={setSelectedUser}
                regions={regions}
                placeholder="Buscar usuario por nombre..."
                required
                disabled={uploading}
              />

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comprobante de Pago <span className="text-red-500">*</span>
                </label>
                <div 
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <div className="space-y-1 text-center">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <span className="font-medium text-blue-600">Subir archivo</span>
                      <span className="pl-1">o arrastra y suelta</span>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={uploading}
                    />
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Vista previa:</h4>
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Vista previa del comprobante"
                      className="max-w-full h-48 object-contain mx-auto rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* Uploaded Image URL */}
              {uploadedImageUrl && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Enlace generado:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 break-all">{uploadedImageUrl}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleCloseUploadModal}
              disabled={uploading}
              className="w-full sm:w-auto"
            >
            {/* Conference Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conferencia <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedConference}
                onChange={(e) => setSelectedConference(e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                required
                disabled={uploading}
              >
                <option value="">Seleccionar conferencia</option>
                {conferences.map(conference => (
                  <option key={conference.id} value={conference.id}>
                    {conference.nombres} - {conference.nombreRegion}
                  </option>
                ))}
              </select>
            </div>

              {uploadSuccess ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!uploadSuccess && (
              <Button 
                onClick={handleUploadAndRegister}
                loading={uploading}
                disabled={uploading || !selectedFile || !selectedUser || !selectedConference}
                icon={Upload}
                className="w-full sm:w-auto"
              >
                {uploading ? 'Procesando...' : 'Subir y Registrar'}
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Comprobante de Pago"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <img
              src={selectedImageUrl}
              alt="Comprobante de pago"
              className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.className = 'text-center py-8 text-gray-500';
                errorDiv.innerHTML = '<p>No se pudo cargar la imagen</p>';
                target.parentNode?.appendChild(errorDiv);
              }}
            />
          </div>
          <div className="flex justify-center space-x-3">
            <Button
              variant="secondary"
              icon={ExternalLink}
              onClick={() => window.open(selectedImageUrl, '_blank')}
            >
              Abrir en nueva pestaña
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsImageModalOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Pago"
        message={`¿Estás seguro de que deseas eliminar el pago de "${paymentToDelete?.nombreUsuario}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
};