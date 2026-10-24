import React from 'react';
import { TicketStatus } from '../types';

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<TicketStatus, { label: string; bg: string; text: string; dot: string }> = {
    OPEN: {
      label: 'Open',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400 animate-pulse',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      text: 'text-indigo-400',
      dot: 'bg-indigo-400',
    },
    WAITING_ON_CUSTOMER: {
      label: 'Waiting on Customer',
      bg: 'bg-amber-500/10 border-amber-500/20',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
    },
    RESOLVED: {
      label: 'Resolved',
      bg: 'bg-violet-500/10 border-violet-500/20',
      text: 'text-violet-400',
      dot: 'bg-violet-400',
    },
    CLOSED: {
      label: 'Closed',
      bg: 'bg-slate-500/10 border-slate-500/20',
      text: 'text-slate-400',
      dot: 'bg-slate-400',
    },
  };

  const config = configs[status] || configs.OPEN;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
