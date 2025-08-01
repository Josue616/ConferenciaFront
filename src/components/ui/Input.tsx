import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon,
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`
            block w-full rounded-lg border-blue-200 shadow-sm bg-gradient-to-r from-white to-blue-50
            focus:ring-blue-500 focus:border-blue-500 focus:bg-white
            ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' : ''}
            ${className}
            transition-all duration-200
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};