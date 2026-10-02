import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  Sparkles, 
  FlaskConical, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu
} from 'lucide-react';
import { Ticket } from '../../types';

export type ActiveTab = 'dashboard' | 'inbox' | 'analyze' | 'prompt-lab' | 'evaluation';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  tickets: Ticket[];
  isLiveLLM: boolean;
  onOpenNewTicket: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  tickets,
  isLiveLLM,
  onOpenNewTicket
}) => {
  const needsReviewCount = tickets.filter(t => t.status === 'needs review').length;
  const urgentCount = tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved').length;

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'inbox' as ActiveTab,
      label: 'Ticket Inbox',
      icon: Inbox,
      badge: needsReviewCount > 0 ? needsReviewCount : null,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'analyze' as ActiveTab,
      label: 'AI Triage Copilot',
      icon: Sparkles,
      badge: 'Interactive',
      badgeColor: 'bg-indigo-100 text-indigo-700'
    },
    {
      id: 'prompt-lab' as ActiveTab,
      label: 'Prompt Lab',
      icon: FlaskConical,
      badge: 'Compare',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'evaluation' as ActiveTab,
      label: 'Model Evaluation',
      icon: CheckCircle2,
      badge: 'Benchmark',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
              AI Support Copilot
            </h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block">
              Triage & Draft Assistant
            </span>
          </div>
        </div>
      </div>

      {/* Mode Status Pill */}
      <div className="px-4 pt-4 pb-2">
        <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
          isLiveLLM 
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' 
            : 'bg-slate-800/80 border-slate-700 text-slate-300'
        }`}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isLiveLLM ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isLiveLLM ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <div className="flex flex-col">
              <span className="font-medium text-[11px] leading-tight text-white">
                {isLiveLLM ? 'Live LLM Active' : 'Deterministic Demo Mode'}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                {isLiveLLM ? 'Server API Key Configured' : 'Offline Heuristics Engine'}
              </span>
            </div>
          </div>
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-indigo-800 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Urgent Alert Pill if any */}
        {urgentCount > 0 && (
          <div className="pt-3">
            <button
              onClick={() => setActiveTab('inbox')}
              className="w-full p-2.5 bg-red-950/40 border border-red-800/50 hover:bg-red-900/40 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-red-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  {urgentCount} Urgent Ticket{urgentCount > 1 ? 's' : ''}
                </span>
                <span className="text-[10px] text-red-400 underline">Review</span>
              </div>
            </button>
          </div>
        )}
      </nav>

      {/* Safety Notice & Footer */}
      <div className="p-3 border-t border-slate-800 space-y-3">
        <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium text-[11px] mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Human-in-the-Loop</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            AI drafts are never auto-sent. Customer replies require manual agent approval.
          </p>
        </div>

        <button
          onClick={onOpenNewTicket}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Customer Ticket</span>
        </button>

        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>AI Product Intern MVP</span>
          <span className="text-slate-500">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
