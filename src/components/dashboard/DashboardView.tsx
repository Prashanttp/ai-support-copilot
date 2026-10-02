import React from 'react';
import { 
  Inbox, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  UserCheck,
  Smile,
  Meh,
  Frown,
  Flame
} from 'lucide-react';
import { Ticket, TicketCategory, TicketSentiment } from '../../types';
import { ActiveTab } from '../layout/Sidebar';

interface DashboardViewProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  isLiveLLM: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tickets,
  onSelectTicket,
  setActiveTab,
  isLiveLLM
}) => {
  const totalTickets = tickets.length;
  const urgentTickets = tickets.filter(t => t.priority === 'urgent');
  const activeUrgent = urgentTickets.filter(t => t.status !== 'resolved');
  const aiClassified = tickets.filter(t => Boolean(t.analysis));
  const awaitingReview = tickets.filter(t => t.status === 'needs review');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');

  // Category counts
  const categoryCounts: Record<TicketCategory, number> = {
    billing: tickets.filter(t => t.category === 'billing').length,
    product: tickets.filter(t => t.category === 'product').length,
    'account access': tickets.filter(t => t.category === 'account access').length,
    feedback: tickets.filter(t => t.category === 'feedback').length,
    other: tickets.filter(t => t.category === 'other').length,
  };

  // Sentiment counts
  const sentimentCounts: Record<TicketSentiment, number> = {
    positive: tickets.filter(t => t.sentiment === 'positive').length,
    neutral: tickets.filter(t => t.sentiment === 'neutral').length,
    negative: tickets.filter(t => t.sentiment === 'negative').length,
    frustrated: tickets.filter(t => t.sentiment === 'frustrated').length,
  };

  // Average confidence
  const avgConfidence = aiClassified.length > 0
    ? (aiClassified.reduce((acc, t) => acc + (t.analysis?.confidence || 0), 0) / aiClassified.length) * 100
    : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Human-in-the-Loop Guardrail Notice */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 flex items-start justify-between shadow-sm">
        <div className="flex items-start space-x-3.5">
          <div className="p-2 bg-indigo-600 rounded-lg text-white mt-0.5 shadow-sm shadow-indigo-600/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-indigo-950">
                Supervised Autonomous Copilot (Human-in-the-Loop Guardrails Active)
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-full">
                Zero Auto-Dispatch
              </span>
            </div>
            <p className="text-xs text-indigo-900/80 mt-1 leading-relaxed max-w-3xl">
              All AI-generated replies remain as un-sent drafts in the triage queue. Critical billing inquiries, account access lockouts, and tickets with confidence under 82% are automatically flagged for human agent sign-off.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('prompt-lab')}
          className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 shrink-0 ml-4 py-1.5 px-3 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50/50 transition-colors"
        >
          <span>Inspect Prompt Schema</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Tickets */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inquiries</span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{totalTickets}</span>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              100% indexed
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>{resolvedTickets.length} resolved</span>
            <span className="text-indigo-600 font-medium">{tickets.filter(t => t.status === 'new').length} new inbound</span>
          </div>
        </div>

        {/* Urgent Tickets */}
        <div className="bg-white p-5 rounded-xl border border-red-200/80 shadow-sm hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Urgent Priority</span>
            <div className="p-2 bg-red-100 rounded-lg text-red-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-red-600 tracking-tight">{activeUrgent.length}</span>
            <span className="text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-semibold">
              Action Required
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>{urgentTickets.length} total urgent</span>
            <span className="text-slate-500">{urgentTickets.length - activeUrgent.length} handled</span>
          </div>
        </div>

        {/* AI-Classified Tickets */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Classification</span>
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {Math.round((aiClassified.length / (totalTickets || 1)) * 100)}%
            </span>
            <span className="text-xs text-indigo-600 font-medium bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
              {avgConfidence.toFixed(0)}% avg conf.
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>{aiClassified.length} of {totalTickets} analyzed</span>
            <span className="text-slate-700 font-medium">{isLiveLLM ? 'Live LLM' : 'Deterministic'}</span>
          </div>
        </div>

        {/* Tickets Awaiting Human Review */}
        <div className="bg-white p-5 rounded-xl border border-amber-200/80 shadow-sm hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Awaiting Human Review</span>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-amber-900 tracking-tight">{awaitingReview.length}</span>
            <button
              onClick={() => setActiveTab('inbox')}
              className="text-xs text-amber-800 font-semibold hover:underline flex items-center gap-0.5"
            >
              Open Queue &rarr;
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Requires agent sign-off</span>
            <span className="text-amber-800 font-medium">Pending approval</span>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Inquiry Taxonomy Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of support tickets classified across operational domains</p>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
              5 Primary Classes
            </span>
          </div>

          <div className="space-y-3.5">
            {[
              { label: 'Billing & Payments', key: 'billing' as TicketCategory, count: categoryCounts.billing, color: 'bg-emerald-500' },
              { label: 'Product & Engineering Issues', key: 'product' as TicketCategory, count: categoryCounts.product, color: 'bg-blue-500' },
              { label: 'Account Access & Security', key: 'account access' as TicketCategory, count: categoryCounts['account access'], color: 'bg-amber-500' },
              { label: 'Product Feedback & Wishlist', key: 'feedback' as TicketCategory, count: categoryCounts.feedback, color: 'bg-purple-500' },
              { label: 'Other / Inquiries', key: 'other' as TicketCategory, count: categoryCounts.other, color: 'bg-slate-400' },
            ].map((cat) => {
              const percentage = totalTickets > 0 ? Math.round((cat.count / totalTickets) * 100) : 0;
              return (
                <div key={cat.key}>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cat.color}`}></span>
                      {cat.label}
                    </span>
                    <span className="text-slate-500">
                      {cat.count} tickets ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sentiment & Quick Diagnostics */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Customer Sentiment</h3>
              <span className="text-xs font-medium text-slate-400">Real-time NLP</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-red-50/60 border border-red-100 rounded-lg flex items-center space-x-3">
                <Flame className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <div className="text-lg font-bold text-red-700">{sentimentCounts.frustrated}</div>
                  <div className="text-[10px] text-red-600 uppercase font-semibold">Frustrated</div>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg flex items-center space-x-3">
                <Frown className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <div className="text-lg font-bold text-amber-800">{sentimentCounts.negative}</div>
                  <div className="text-[10px] text-amber-700 uppercase font-semibold">Negative</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center space-x-3">
                <Meh className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <div className="text-lg font-bold text-slate-700">{sentimentCounts.neutral}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Neutral</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg flex items-center space-x-3">
                <Smile className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-lg font-bold text-emerald-700">{sentimentCounts.positive}</div>
                  <div className="text-[10px] text-emerald-600 uppercase font-semibold">Positive</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
            <div className="font-semibold text-slate-800 flex items-center justify-between">
              <span>Production Safety Metric</span>
              <span className="text-emerald-700 font-bold">100% Guarded</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              No replies are automatically dispatched to customers. Human review required on all monetary adjustments and credential lockouts.
            </p>
          </div>
        </div>
      </div>

      {/* Urgent & High-Priority Attention Queue */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>High-Priority Triage Queue</span>
              <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                {tickets.filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'resolved').length} Open
              </span>
            </h3>
            <p className="text-xs text-slate-500">Tickets requiring urgent supervisor review or engineering triage</p>
          </div>
          <button
            onClick={() => setActiveTab('inbox')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All Tickets in Inbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {tickets
            .filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'resolved')
            .slice(0, 4)
            .map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => {
                  onSelectTicket(ticket.id);
                  setActiveTab('inbox');
                }}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shrink-0 ${
                    ticket.priority === 'urgent'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {ticket.priority}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {ticket.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {ticket.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{ticket.customerName}</span>
                      <span>&bull;</span>
                      <span className="capitalize">{ticket.category}</span>
                      <span>&bull;</span>
                      <span className="text-slate-400">Tier: {ticket.customerTier}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {ticket.analysis?.humanReviewRequired && (
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
                      Human Review Flagged
                    </span>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-md font-medium capitalize ${
                    ticket.status === 'needs review'
                      ? 'bg-amber-100 text-amber-800'
                      : ticket.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {ticket.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTicket(ticket.id);
                      setActiveTab('inbox');
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Open &rarr;
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
