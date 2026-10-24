import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  RefreshCw,
  FolderOpen,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { EmptyState } from '../components/EmptyState';
import { api } from '../api';
import { Ticket, TicketStatus, TicketPriority, User } from '../types';

interface TicketsPageProps {
  currentUser: User | null;
  onSelectTicket: (ticketId: string) => void;
  onCreateTicketClick: () => void;
}

export const TicketsPage: React.FC<TicketsPageProps> = ({
  currentUser,
  onSelectTicket,
  onCreateTicketClick,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const loadTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTickets({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        search: search.trim() ? search.trim() : undefined,
      });
      setTickets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTickets();
  };

  const filteredTickets = tickets.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.customerName?.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Support Tickets</h2>
          <p className="text-xs text-slate-400">
            {currentUser?.role === 'CUSTOMER'
              ? 'Your submitted tickets and status updates.'
              : 'Enterprise triage queue with SLA priorities and ownership.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTickets}
            className="p-2.5 rounded-xl bg-navy-900 border border-navy-700 text-slate-400 hover:text-white transition"
            title="Refresh tickets"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onCreateTicketClick}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-glow-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={loadTickets} className="underline text-white font-medium">
            Try Again
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description, customer, or ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-brand-500 transition"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_ON_CUSTOMER">Waiting on Customer</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Priority selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden shadow-card">
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            <span className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading ticket queue...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FolderOpen}
              title="No tickets found"
              description="No support tickets match your current filters or query."
              actionText="Create New Ticket"
              onAction={onCreateTicketClick}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950/60 border-b border-navy-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket ID & Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Assigned Agent</th>
                  <th className="py-3 px-4">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket.id)}
                    className="hover:bg-navy-850/70 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-brand-400 font-semibold">
                          #{ticket.id.slice(0, 8)}
                        </span>
                        <span className="font-semibold text-white group-hover:text-brand-300 transition truncate">
                          {ticket.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {ticket.description}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={ticket.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={ticket.priority} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700 font-mono text-[11px]">
                        {ticket.category || 'General'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="font-medium text-white">{ticket.customerName}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {ticket.customerEmail}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {ticket.assignedToName ? (
                        <span className="text-slate-200 font-medium">{ticket.assignedToName}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
