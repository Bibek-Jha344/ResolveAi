import React from 'react';
import { TicketPriority } from '../types';
import { AlertCircle, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TicketPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const configs: Record<
    TicketPriority,
    { label: string; bg: string; text: string; icon: React.ReactNode }
  > = {
    URGENT: {
      label: 'Urgent',
      bg: 'bg-rose-500/10 border-rose-500/25',
      text: 'text-rose-400 font-semibold',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />,
    },
    HIGH: {
      label: 'High',
      bg: 'bg-amber-500/10 border-amber-500/25',
      text: 'text-amber-400',
      icon: <ArrowUp className="w-3.5 h-3.5 text-amber-400" />,
    },
    MEDIUM: {
      label: 'Medium',
      bg: 'bg-blue-500/10 border-blue-500/25',
      text: 'text-blue-400',
      icon: <ArrowRight className="w-3.5 h-3.5 text-blue-400" />,
    },
    LOW: {
      label: 'Low',
      bg: 'bg-slate-500/10 border-slate-500/25',
      text: 'text-slate-400',
      icon: <ArrowDown className="w-3.5 h-3.5 text-slate-400" />,
    },
  };

  const config = configs[priority] || configs.MEDIUM;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${config.bg} ${config.text} ${sizeClasses}`}>
      {config.icon}
      {config.label}
    </span>
  );
};
