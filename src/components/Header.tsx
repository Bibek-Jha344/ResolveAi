import React from 'react';
import { Menu, Activity, Plus, Search, ShieldCheck } from 'lucide-react';
import { User, SystemHealth } from '../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
  currentUser: User | null;
  health: SystemHealth | null;
  onQuickAction?: () => void;
  quickActionLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
  currentUser,
  health,
  onQuickAction,
  quickActionLabel,
}) => {
  const isHealthy = health?.status === 'UP';

  return (
    <header className="sticky top-0 z-30 h-16 bg-navy-900/90 backdrop-blur-md border-b border-navy-800 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 lg:hidden transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend Connectivity Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-800/80 border border-navy-700/60 text-xs">
          <Activity
            className={`w-3.5 h-3.5 ${
              isHealthy ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
            }`}
          />
          <span className="text-slate-400 font-medium">
            Backend:{' '}
            <span className={isHealthy ? 'text-emerald-400' : 'text-amber-400'}>
              {health?.status || 'Connecting...'}
            </span>
          </span>
          {health?.aiProvider && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-navy-700 text-brand-300 border border-navy-600">
              {health.aiProviderName || 'AI Ready'}
            </span>
          )}
        </div>

        {/* Quick Action Button */}
        {quickActionLabel && onQuickAction && (
          <button
            onClick={onQuickAction}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-glow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{quickActionLabel}</span>
          </button>
        )}

        {/* User Mini Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-navy-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-semibold text-white leading-tight">
              {currentUser?.name || 'Guest'}
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">
              {currentUser?.role || 'CUSTOMER'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
