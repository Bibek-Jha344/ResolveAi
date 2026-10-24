import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CreateTicketModal } from './components/CreateTicketModal';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TicketsPage } from './pages/TicketsPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './api';
import { User, SystemHealth, Ticket } from './types';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => api.getCurrentUser());
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'app'>(() => {
    return api.getCurrentUser() ? 'app' : 'landing';
  });
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  // Check backend health periodically
  useEffect(() => {
    const check = () => {
      api.getSystemHealth()
        .then((h) => setSystemHealth(h))
        .catch(() =>
          setSystemHealth({
            status: 'DOWN',
            database: 'DISCONNECTED',
            vectorStore: 'FALLBACK',
            aiProvider: 'UNCONFIGURED',
            aiProviderName: 'None',
            version: '1.0.0',
            uptimeSeconds: 0,
          })
        );
    };
    check();
    const timer = setInterval(check, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setView('app');
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setView('landing');
    setSelectedTicketId(null);
  };

  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id);
    setCurrentTab('ticket-detail');
  };

  const handleTicketCreated = (ticket: Ticket) => {
    // Navigate to ticket detail
    setSelectedTicketId(ticket.id);
    setCurrentTab('ticket-detail');
  };

  // Unauthenticated views
  if (view === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setView('register')}
        onLogin={() => setView('login')}
      />
    );
  }

  if (view === 'login') {
    return (
      <LoginPage
        onSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setView('register')}
        onBackToHome={() => setView('landing')}
      />
    );
  }

  if (view === 'register') {
    return (
      <RegisterPage
        onSuccess={handleLoginSuccess}
        onNavigateToLogin={() => setView('login')}
        onBackToHome={() => setView('landing')}
      />
    );
  }

  // Dashboard Tab titles
  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Overview & Activity', subtitle: 'Platform metrics and recent tickets' },
    tickets: { title: 'Support Tickets', subtitle: 'Triage, SLA response times, and team queue' },
    'ticket-detail': { title: 'Ticket Detail', subtitle: 'Conversation history and resolution actions' },
    'ai-assistant': { title: 'AI Support Copilot', subtitle: 'RAG-grounded responses with citations' },
    'knowledge-base': { title: 'Knowledge Base Index', subtitle: 'Document ingestion and pgvector chunk management' },
    analytics: { title: 'Analytics & KPIs', subtitle: 'System performance, resolution rates, and CSAT' },
    team: { title: 'Team Directory', subtitle: 'User roles, agents, and access management' },
    settings: { title: 'Platform Settings', subtitle: 'System diagnostics, environment, and security' },
  };

  const { title, subtitle } = tabTitles[currentTab] || {
    title: 'ResolveAI Dashboard',
    subtitle: '',
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex">
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedTicketId(null);
          setCurrentTab(tab);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          currentUser={currentUser}
          health={systemHealth}
          quickActionLabel={currentUser?.role !== 'CUSTOMER' ? 'New Ticket' : undefined}
          onQuickAction={() => setIsCreateTicketModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardPage
              currentUser={currentUser}
              onNavigateToTickets={() => setCurrentTab('tickets')}
              onNavigateToAi={() => setCurrentTab('ai-assistant')}
              onSelectTicket={handleSelectTicket}
              onCreateTicketClick={() => setIsCreateTicketModalOpen(true)}
            />
          )}

          {currentTab === 'tickets' && (
            <TicketsPage
              currentUser={currentUser}
              onSelectTicket={handleSelectTicket}
              onCreateTicketClick={() => setIsCreateTicketModalOpen(true)}
            />
          )}

          {currentTab === 'ticket-detail' && selectedTicketId && (
            <TicketDetailPage
              ticketId={selectedTicketId}
              currentUser={currentUser}
              onBack={() => {
                setSelectedTicketId(null);
                setCurrentTab('tickets');
              }}
            />
          )}

          {currentTab === 'ai-assistant' && (
            <AiAssistantPage
              onNavigateToKnowledgeBase={() => setCurrentTab('knowledge-base')}
            />
          )}

          {currentTab === 'knowledge-base' && <KnowledgeBasePage />}

          {currentTab === 'analytics' && <AnalyticsPage />}

          {currentTab === 'team' && <TeamPage currentUser={currentUser} />}

          {currentTab === 'settings' && <SettingsPage currentUser={currentUser} />}
        </main>
      </div>

      {/* Modal for creating a ticket */}
      <CreateTicketModal
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
};
export default App;
