import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  User as UserIcon,
  Tag,
  Send,
  Lock,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { api } from '../api';
import { Ticket, TicketComment, TicketStatus, TicketPriority, User } from '../types';

interface TicketDetailPageProps {
  ticketId: string;
  currentUser: User | null;
  onBack: () => void;
}

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({
  ticketId,
  currentUser,
  onBack,
}) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Comment state
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Updating ticket metadata
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadTicket = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTicketById(ticketId);
      setTicket(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ticket details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await api.updateTicket(ticket.id, { status: newStatus });
      setTicket((prev) => (prev ? { ...prev, status: updated.status } : null));
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!ticket) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await api.updateTicket(ticket.id, { priority: newPriority });
      setTicket((prev) => (prev ? { ...prev, priority: updated.priority } : null));
    } catch (err: any) {
      alert('Failed to update priority: ' + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !ticket) return;

    setIsSubmitting(true);
    try {
      const newComment = await api.addTicketComment(ticket.id, {
        content: commentText.trim(),
        isInternal: isInternal,
      });

      setTicket((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...(prev.comments || []), newComment],
        };
      });
      setCommentText('');
      setIsInternal(false);
    } catch (err: any) {
      alert('Failed to post reply: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <span className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Loading ticket #{ticketId.slice(0, 8)}...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-8 text-center bg-navy-900 border border-navy-800 rounded-2xl max-w-xl mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Error Loading Ticket</h3>
        <p className="text-xs text-slate-400 mb-6">{error || 'Ticket not found'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold"
        >
          Return to Tickets
        </button>
      </div>
    );
  }

  const isStaff = currentUser?.role === 'ADMIN' || currentUser?.role === 'AGENT';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </button>

        <span className="font-mono text-xs text-slate-400">ID: {ticket.id}</span>
      </div>

      {/* Ticket Header & Metadata Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Info Card */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <span className="px-2.5 py-0.5 rounded-full bg-navy-800 text-slate-300 border border-navy-700 text-xs font-mono">
                {ticket.category || 'General Support'}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight">{ticket.title}</h1>

            <div className="p-4 rounded-xl bg-navy-850/80 border border-navy-800 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>

            <div className="pt-3 border-t border-navy-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Opened {new Date(ticket.createdAt).toLocaleString()} by{' '}
                  <strong className="text-white">{ticket.customerName}</strong>
                </span>
              </div>
              <span>
                Last activity:{' '}
                {new Date(ticket.updatedAt || ticket.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Activity & Comments Thread */}
          <div className="rounded-2xl bg-navy-900 border border-navy-800 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-400" />
                <span>Conversation & History</span>
              </h3>
              <span className="text-xs text-slate-400">
                {(ticket.comments || []).length} responses
              </span>
            </div>

            {/* Comments List */}
            {(!ticket.comments || ticket.comments.length === 0) ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No comments or updates yet. Post the first response below.
              </div>
            ) : (
              <div className="space-y-4">
                {ticket.comments.map((comment) => {
                  const isStaffComment =
                    comment.authorRole === 'ADMIN' || comment.authorRole === 'AGENT';
                  return (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-xl border transition ${
                        comment.isInternal
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : isStaffComment
                          ? 'bg-brand-950/20 border-brand-500/30'
                          : 'bg-navy-850/70 border-navy-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-navy-800 flex items-center justify-center font-bold text-[10px] text-white">
                            {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span className="text-xs font-semibold text-white">
                            {comment.authorName}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                              isStaffComment
                                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                            }`}
                          >
                            {comment.authorRole}
                          </span>
                          {comment.isInternal && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                              <Lock className="w-2.5 h-2.5" /> Internal Note
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400">
                          {new Date(comment.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed pl-8">
                        {comment.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="pt-4 border-t border-navy-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Post Reply / Update
              </label>
              <textarea
                rows={3}
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Type your response to the customer or team..."
                className="w-full p-3 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-brand-500 transition resize-y"
              />

              <div className="flex items-center justify-between">
                {isStaff ? (
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-navy-700 bg-navy-850 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="flex items-center gap-1 text-amber-300">
                      <Lock className="w-3 h-3" /> Staff Internal Note (hidden from customer)
                    </span>
                  </label>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-sm transition flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Response</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Controls (1 col) */}
        <div className="space-y-6">
          {/* Status & Priority controls */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-5">
            <h3 className="text-sm font-bold text-white border-b border-navy-800 pb-2.5">
              Ticket Controls
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Lifecycle Status
              </label>
              <select
                value={ticket.status}
                disabled={isUpdatingStatus}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-brand-500 transition"
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="WAITING_ON_CUSTOMER">WAITING ON CUSTOMER</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Priority Level
              </label>
              <select
                value={ticket.priority}
                disabled={isUpdatingStatus}
                onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-brand-500 transition"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div className="pt-3 border-t border-navy-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Customer:</span>
                <span className="font-medium text-white">{ticket.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Contact:</span>
                <span className="font-medium text-white truncate max-w-[150px]">
                  {ticket.customerEmail}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Assignee:</span>
                <span className="font-medium text-white">
                  {ticket.assignedToName || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
