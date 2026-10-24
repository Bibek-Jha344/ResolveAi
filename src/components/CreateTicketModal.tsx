import React, { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../api';
import { TicketPriority, Ticket } from '../types';
import { AlertCircle, Plus } from 'lucide-react';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: (newTicket: Ticket) => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onTicketCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [category, setCategory] = useState('Technical Support');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and detailed description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await api.createTicket({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
      });

      onTicketCreated(created);
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setCategory('Technical Support');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Support Ticket"
      subtitle="Submit an issue for triage and automated RAG resolution"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ticket Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cannot connect webhook endpoint to production server"
            className="w-full px-3 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent (SLA Risk)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="Technical Support">Technical Support</option>
              <option value="Billing & Invoicing">Billing & Invoicing</option>
              <option value="Account Access">Account Access</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Bug Report">Bug Report</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Detailed Description
          </label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain the issue, error codes, steps to reproduce, or relevant background..."
            className="w-full p-3 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-brand-500 resize-y"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-navy-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-sm transition flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Submit Ticket</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
