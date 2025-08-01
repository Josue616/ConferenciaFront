import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div 
        className="flex items-center justify-center min-h-full"
        onClick={handleBackdropClick}
      >
        {/* Backdrop con overlay más sutil */}
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity" />
        
        {/* Modal */}
        <div className={`relative w-full ${sizes[size]} bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl border border-blue-100 transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] flex flex-col`}>
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-5 border-b border-blue-100 bg-gradient-to-r from-blue-100 to-purple-100 rounded-t-2xl">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 text-blue-400 hover:text-blue-600 hover:bg-white hover:bg-opacity-50 rounded-full transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};