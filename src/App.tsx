import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { InboxView } from './components/inbox/InboxView';
import { AnalyzeView } from './components/analyzer/AnalyzeView';
import { PromptLabView } from './components/prompt-lab/PromptLabView';
import { EvaluationView } from './components/evaluation/EvaluationView';
import { SettingsModal } from './components/settings/SettingsModal';
import { NewTicketModal } from './components/inbox/NewTicketModal';
import { initialTickets } from './data/mockTickets';
import { Ticket, TicketStatus } from './types';
import { checkApiStatus, ApiStatus, requestAIAnalysis } from './lib/apiClient';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('ai_support_copilot_tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return initialTickets;
  });

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    status: 'online',
    liveLLMConfigured: false,
    provider: 'Deterministic Heuristics Engine',
    mode: 'demo-mode'
  });

  // Save tickets to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem('ai_support_copilot_tickets', JSON.stringify(tickets));
  }, [tickets]);

  // Discover server API status on mount
  useEffect(() => {
    checkApiStatus().then(status => {
      setApiStatus(status);
    });
  }, []);

  const handleUpdateTicketStatus = (ticketId: string, status: TicketStatus, editedDraft?: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            status,
            editedDraftResponse: editedDraft !== undefined ? editedDraft : t.editedDraftResponse,
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Support Agent'
          };
        }
        return t;
      })
    );
  };

  const handleReanalyzeTicket = async (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const analysis = await requestAIAnalysis(ticket.message);
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            category: analysis.category,
            priority: analysis.priority,
            sentiment: analysis.sentiment,
            analysis,
            status: analysis.humanReviewRequired ? 'needs review' : t.status
          };
        }
        return t;
      })
    );
  };

  const handleAddTicket = (ticket: Ticket) => {
    setTickets(prev => [ticket, ...prev]);
    setSelectedTicketId(ticket.id);
    setActiveTab('inbox');
  };

  const handleRefreshData = () => {
    setTickets(initialTickets);
    localStorage.removeItem('ai_support_copilot_tickets');
    checkApiStatus().then(status => setApiStatus(status));
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tickets={tickets}
        isLiveLLM={apiStatus.liveLLMConfigured}
        onOpenNewTicket={() => setIsNewTicketOpen(true)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          activeTab={activeTab}
          isLiveLLM={apiStatus.liveLLMConfigured}
          onRefresh={handleRefreshData}
          onOpenSettings={() => setIsSettingsOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              tickets={tickets}
              onSelectTicket={(id) => {
                setSelectedTicketId(id);
                setActiveTab('inbox');
              }}
              setActiveTab={setActiveTab}
              isLiveLLM={apiStatus.liveLLMConfigured}
            />
          )}

          {activeTab === 'inbox' && (
            <InboxView
              tickets={tickets}
              selectedTicketId={selectedTicketId}
              onSelectTicket={setSelectedTicketId}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              onReanalyzeTicket={handleReanalyzeTicket}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {activeTab === 'analyze' && (
            <AnalyzeView
              onAddTicketToInbox={handleAddTicket}
              isLiveLLM={apiStatus.liveLLMConfigured}
            />
          )}

          {activeTab === 'prompt-lab' && (
            <PromptLabView isLiveLLM={apiStatus.liveLLMConfigured} />
          )}

          {activeTab === 'evaluation' && (
            <EvaluationView isLiveLLM={apiStatus.liveLLMConfigured} />
          )}
        </main>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiStatus={apiStatus}
      />

      <NewTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        onAddTicket={handleAddTicket}
      />
    </div>
  );
};

export default App;
