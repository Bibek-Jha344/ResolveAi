import React from 'react';
import {
  LayoutDashboard,
  Ticket,
  Bot,
  BookOpen,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  isOpen,
  onClose,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tickets', label: 'Tickets', icon: Ticket, badge: 'Live' },
    { id: 'ai-assistant', label: 'AI Support Copilot', icon: Bot, isAi: true },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart3 },
    ...(currentUser?.role === 'ADMIN' || currentUser?.role === 'AGENT'
      ? [{ id: 'team', label: 'Team & Agents', icon: Users }]
      : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const roleColor = {
    ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    AGENT: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    CUSTOMER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  }[currentUser?.role || 'CUSTOMER'];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 flex flex-col bg-navy-900 border-r border-navy-800 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-navy-800/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center shadow-glow-sm">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                Resolve<span className="text-brand-400">AI</span>
              </span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Customer Support SaaS
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Platform Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.isAi ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gradient-to-r from-brand-500/20 to-accent-violet/20 border border-brand-400/30 text-brand-300">
                    <Sparkles className="w-2.5 h-2.5" />
                    RAG
                  </span>
                ) : item.badge ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-navy-800 bg-navy-950/40">
          <div className="p-3 rounded-xl bg-navy-800/60 border border-navy-700/50 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-navy-700 border border-navy-600 flex items-center justify-center font-bold text-white text-sm">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser?.name || 'Guest User'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-navy-700/50 flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleColor}`}
              >
                <ShieldCheck className="w-3 h-3" />
                {currentUser?.role || 'CUSTOMER'}
              </span>
              <span className="text-[11px] text-slate-400">Online</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
