import React, { useState } from 'react';
import { 
  Ticket, 
  TicketCategory, 
  TicketPriority, 
  TicketStatus, 
  TicketSentiment 
} from '../../types';
import { 
  Filter, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Edit3, 
  Sparkles, 
  ShieldAlert, 
  Tag, 
  ArrowLeft,
  Check,
  RotateCcw,
  Search
} from 'lucide-react';

interface InboxViewProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string | null) => void;
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus, editedDraft?: string) => void;
  onReanalyzeTicket: (ticketId: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  onUpdateTicketStatus,
  onReanalyzeTicket,
  searchQuery,
  setSearchQuery
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isEditingDraft, setIsEditingDraft] = useState<boolean>(false);
  const [draftText, setDraftText] = useState<string>('');
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);
  const [isReanalyzing, setIsReanalyzing] = useState<boolean>(false);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;

  // Sync draft text when selected ticket changes
  React.useEffect(() => {
    if (selectedTicket) {
      setDraftText(selectedTicket.editedDraftResponse || selectedTicket.analysis?.suggestedResponse || '');
      setIsEditingDraft(false);
      setCopiedDraft(false);
    }
  }, [selectedTicketId, selectedTicket?.editedDraftResponse, selectedTicket?.analysis?.suggestedResponse]);

  // Filtering
  const filteredTickets = tickets.filter(ticket => {
    if (categoryFilter !== 'all' && ticket.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = ticket.subject.toLowerCase().includes(q);
      const matchMsg = ticket.message.toLowerCase().includes(q);
      const matchCustomer = ticket.customerName.toLowerCase().includes(q);
      const matchEmail = ticket.customerEmail.toLowerCase().includes(q);
      const matchId = ticket.id.toLowerCase().includes(q);
      if (!matchSubject && !matchMsg && !matchCustomer && !matchEmail && !matchId) {
        return false;
      }
    }
    return true;
  });

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  const handleSaveDraft = () => {
    if (selectedTicket) {
      onUpdateTicketStatus(selectedTicket.id, selectedTicket.status, draftText);
      setIsEditingDraft(false);
    }
  };

  const handleTriggerReanalyze = async () => {
    if (!selectedTicket) return;
    setIsReanalyzing(true);
    try {
      await onReanalyzeTicket(selectedTicket.id);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const getPriorityBadgeClass = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCategoryBadgeClass = (cat: TicketCategory) => {
    switch (cat) {
      case 'billing':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'product':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'account access':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'feedback':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'other':
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getSentimentPill = (sentiment: TicketSentiment) => {
    switch (sentiment) {
      case 'positive':
        return <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200">Positive</span>;
      case 'neutral':
        return <span className="text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded font-medium border border-slate-200">Neutral</span>;
      case 'negative':
        return <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200">Negative</span>;
      case 'frustrated':
        return <span className="text-[10px] text-red-800 bg-red-50 px-1.5 py-0.5 rounded font-medium border border-red-200">Frustrated</span>;
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'approved':
        return <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case 'needs review':
        return <span className="text-[11px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Needs Review</span>;
      case 'resolved':
        return <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Resolved</span>;
      case 'new':
        return <span className="text-[11px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" /> New</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      {/* Top Filter Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <Tag className="w-3.5 h-3.5" />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md text-xs py-1 px-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Categories ({tickets.length})</option>
              <option value="billing">Billing</option>
              <option value="product">Product</option>
              <option value="account access">Account Access</option>
              <option value="feedback">Feedback</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium ml-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md text-xs py-1 px-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium ml-2">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md text-xs py-1 px-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="needs review">Needs Review</option>
              <option value="approved">Approved</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Search & Counter */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{filteredTickets.length}</strong> of {tickets.length} tickets
          </span>
          {(categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setPriorityFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: List on Left, Detail on Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Ticket List Pane */}
        <div className={`${
          selectedTicket ? 'hidden lg:block lg:w-5/12' : 'w-full'
        } border-r border-slate-200 bg-white overflow-y-auto divide-y divide-slate-100 flex flex-col`}>
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center my-auto">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-800 text-sm">No tickets found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No tickets match your active filter criteria. Try adjusting the category, priority, or search term.
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isSelected = ticket.id === selectedTicketId;
              return (
                <div
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket.id)}
                  className={`p-4 transition-all cursor-pointer relative hover:bg-slate-50 ${
                    isSelected ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {ticket.customerName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {ticket.id}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {ticket.customerTier}
                      </span>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <h5 className="font-medium text-xs text-slate-800 mb-1 line-clamp-1">
                    {ticket.subject}
                  </h5>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-2.5 leading-relaxed">
                    {ticket.message}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getPriorityBadgeClass(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`text-[10px] capitalize px-2 py-0.5 rounded border font-medium ${getCategoryBadgeClass(ticket.category)}`}>
                        {ticket.category}
                      </span>
                      {getSentimentPill(ticket.sentiment)}
                    </div>

                    {ticket.analysis?.humanReviewRequired && (
                      <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                        <ShieldAlert className="w-2.5 h-2.5 text-amber-600" />
                        Review Req
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ticket Detail Pane */}
        {selectedTicket ? (
          <div className="flex-1 bg-slate-50 overflow-y-auto flex flex-col">
            {/* Detail Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onSelectTicket(null)}
                  className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 mr-1"
                  title="Back to list"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500 font-semibold">{selectedTicket.id}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-xs text-slate-500">Tier: {selectedTicket.customerTier}</span>
                    <span className="text-slate-300">&bull;</span>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedTicket.subject}
                  </h3>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateTicketStatus(selectedTicket.id, 'needs review', draftText)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedTicket.status === 'needs review'
                      ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Needs Review
                </button>
                <button
                  onClick={() => onUpdateTicketStatus(selectedTicket.id, 'approved', draftText)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedTicket.status === 'approved'
                      ? 'bg-emerald-600 border-emerald-600 text-white font-semibold shadow-sm'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Approve Draft
                </button>
                <button
                  onClick={() => onUpdateTicketStatus(selectedTicket.id, 'resolved', draftText)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedTicket.status === 'resolved'
                      ? 'bg-slate-800 border-slate-800 text-white font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Mark Resolved
                </button>
              </div>
            </div>

            {/* Detail Body */}
            <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
              {/* Customer Thread Box */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                      {selectedTicket.customerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-slate-900">{selectedTicket.customerName}</h4>
                      <p className="text-[11px] text-slate-500">{selectedTicket.customerEmail}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(selectedTicket.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.message}
                </div>
              </div>

              {/* AI Copilot Analysis Card */}
              <div className="bg-white rounded-xl border border-indigo-200 shadow-sm p-5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-indigo-100 rounded-md text-indigo-700">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">AI Copilot Triage Analysis</h4>
                      <span className="text-[10px] text-slate-400">
                        Classified via {selectedTicket.analysis?.source === 'live-llm' ? 'Live LLM API' : 'Deterministic Heuristics Engine'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleTriggerReanalyze}
                    disabled={isReanalyzing}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 p-1 rounded hover:bg-indigo-50 transition-colors"
                    title="Rerun AI Analysis on this message"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin' : ''}`} />
                    <span>{isReanalyzing ? 'Re-analyzing...' : 'Re-run Analysis'}</span>
                  </button>
                </div>

                {/* Extracted Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Category</span>
                    <span className={`inline-block mt-0.5 font-bold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded border ${getCategoryBadgeClass(selectedTicket.category)}`}>
                      {selectedTicket.category}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Priority</span>
                    <span className={`inline-block mt-0.5 font-bold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded border ${getPriorityBadgeClass(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sentiment</span>
                    <div className="mt-1">
                      {getSentimentPill(selectedTicket.sentiment)}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Model Confidence</span>
                    <div className="mt-1 flex items-center space-x-2">
                      <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${Math.round((selectedTicket.analysis?.confidence || 0.85) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-700 text-[11px]">
                        {Math.round((selectedTicket.analysis?.confidence || 0.85) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Issue Summary */}
                <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block mb-0.5">
                    Concise Issue Summary:
                  </span>
                  <p className="text-xs text-indigo-950 font-medium">
                    {selectedTicket.analysis?.summary || 'No summary extracted.'}
                  </p>
                </div>

                {/* Human Review Flag Reason Alert */}
                {selectedTicket.analysis?.humanReviewRequired && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start space-x-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-xs text-amber-900">
                        Human Agent Review Required
                      </h5>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        {selectedTicket.analysis?.humanReviewReason || 'Triggered by high-severity priority or uncertainty threshold.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Suggested Response Draft Area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Suggested Response Draft</span>
                      <span className="text-[10px] text-amber-800 bg-amber-100 font-semibold px-2 py-0.5 rounded-full">
                        Draft Only &bull; Not Dispatched
                      </span>
                    </label>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCopyDraft}
                        className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 px-2 py-1 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
                      >
                        {copiedDraft ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy Draft</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (isEditingDraft) {
                            handleSaveDraft();
                          } else {
                            setIsEditingDraft(true);
                          }
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 px-2 py-1 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{isEditingDraft ? 'Save Edits' : 'Edit Draft'}</span>
                      </button>
                    </div>
                  </div>

                  {isEditingDraft ? (
                    <div className="space-y-2">
                      <textarea
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        rows={7}
                        className="w-full text-xs text-slate-800 p-3 bg-white border-2 border-indigo-400 rounded-lg focus:outline-none leading-relaxed font-sans shadow-sm"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setDraftText(selectedTicket.editedDraftResponse || selectedTicket.analysis?.suggestedResponse || '');
                            setIsEditingDraft(false);
                          }}
                          className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveDraft}
                          className="px-3 py-1 text-xs bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                      {draftText || 'No suggested reply available.'}
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 italic">
                    Safety guardrail: AI responses are generated strictly as drafts for human agents to review and send. No automated email delivery is enabled.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center p-12 text-center text-slate-400">
            <div>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Tag className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-700 text-sm">Select a ticket from the inbox</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Inspect AI extraction, review confidence scores, and verify suggested draft replies before approval.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
