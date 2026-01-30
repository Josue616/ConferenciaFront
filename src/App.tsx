import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { ConferencesModule } from './components/modules/ConferencesModule';
import { UsersModule } from './components/modules/UsersModule';
import { ParticipationsModule } from './components/modules/ParticipationsModule';
import { PaymentsModule } from './components/modules/PaymentsModule';
import { RegionsModule } from './components/modules/RegionsModule';
import { ConferenceReportsModule } from './components/modules/ConferenceReportsModule';
import { InvestorsModule } from './components/modules/InvestorsModule';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('currentView') || 'dashboard';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Cuando el usuario se autentica, forzar la vista al dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
      localStorage.setItem('currentView', 'dashboard');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    localStorage.setItem('currentView', view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'conferences':
        return <ConferencesModule />;
      case 'users':
        return <UsersModule />;
      case 'participations':
        return <ParticipationsModule />;
      case 'payments':
        return <PaymentsModule />;
      case 'regions':
        return <RegionsModule />;
      case 'conferenceReports':
        return <ConferenceReportsModule />;
      case 'investors':
        return <InvestorsModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderCurrentView()}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;