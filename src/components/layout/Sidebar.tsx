import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserCheck, 
  CreditCard, 
  MapPin,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Heart,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const { user, logout, isAdmin } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { id: 'conferences', label: 'Conferencias', icon: Calendar, adminOnly: true },
    { id: 'conferenceReports', label: 'Reportes', icon: BarChart3, adminOnly: true },
    { id: 'users', label: 'Usuarios', icon: Users, adminOnly: false },
    { id: 'participations', label: 'Participaciones', icon: UserCheck, adminOnly: false },
    { id: 'payments', label: 'Pagos', icon: CreditCard, adminOnly: false },
    { id: 'regions', label: 'Regiones', icon: MapPin, adminOnly: true },
    { id: 'investors', label: 'Inversores', icon: Heart, specialAccess: true },
  ];

  const visibleItems = menuItems.filter(item => 
    (!item.adminOnly || isAdmin) && 
    (!item.specialAccess || (isAdmin && user?.nombres === 'Alexander Herrada Toledo') ||(isAdmin && user?.nombres === 'PÉREZ ESCOBAR MAGDA RUTH'))
  );

  return (
    <div className={`bg-gradient-to-b from-blue-50 to-indigo-100 border-r border-blue-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-blue-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">RNDC</h1>
                </div>
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-blue-600" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-blue-600" />
              )}
            </button>
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-b border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 truncate">
                  {user?.nombres}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    user?.rol === 'Admin' 
                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800' 
                      : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                  }`}>
                    {user?.rol}
                  </span>
                  <span className="text-xs text-blue-600">{user?.nombreRegion}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-sm'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                <div className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${isActive ? 'text-blue-600' : 'text-blue-500'}`} />
                </div>
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-blue-200">
          <button
            onClick={logout}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
            {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </div>
    </div>
  );
};