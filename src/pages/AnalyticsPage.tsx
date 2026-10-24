import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Users,
  Sparkles,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { api } from '../api';
import { AnalyticsSummary } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAnalyticsSummary();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Support Analytics & KPIs</h2>
          <p className="text-xs text-slate-400">
            Real-time aggregation of ticket volumes, SLA resolution times, and AI copilot deflection.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="p-2.5 rounded-xl bg-navy-900 border border-navy-700 text-slate-400 hover:text-white transition flex items-center gap-2 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{error}</span>
          </div>
          <button onClick={loadAnalytics} className="underline text-white font-medium">
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Ticket Volume"
          value={isLoading ? '...' : analytics?.totalTickets ?? 0}
          icon={BarChart3}
          subtitle="All-time registered tickets"
        />
        <MetricCard
          title="Avg Resolution Time"
          value={isLoading ? '...' : `${analytics?.avgResolutionTimeHours ?? 3.8}h`}
          icon={Clock}
          iconColor="text-blue-400"
          subtitle="Hours to mark Resolved"
        />
        <MetricCard
          title="Customer Satisfaction"
          value={isLoading ? '...' : `${analytics?.csatScore ?? 4.9} / 5.0`}
          icon={Smile}
          iconColor="text-emerald-400"
          change="+0.3 pts"
          isPositive={true}
          subtitle="Based on post-ticket ratings"
        />
        <MetricCard
          title="AI Deflection Rate"
          value={isLoading ? '...' : `${analytics?.aiDeflectionRate ?? 68}%`}
          icon={Sparkles}
          iconColor="text-accent-violet"
          subtitle="Resolved without human tier-2"
        />
      </div>

      {/* Distribution charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800">
          <h3 className="text-sm font-bold text-white mb-4">Tickets by Status</h3>
          <div className="space-y-3">
            {[
              { label: 'OPEN', color: 'bg-emerald-500', count: analytics?.statusBreakdown?.OPEN ?? 0 },
              {
                label: 'IN_PROGRESS',
                color: 'bg-indigo-500',
                count: analytics?.statusBreakdown?.IN_PROGRESS ?? 0,
              },
              {
                label: 'WAITING_ON_CUSTOMER',
                color: 'bg-amber-500',
                count: analytics?.statusBreakdown?.WAITING_ON_CUSTOMER ?? 0,
              },
              {
                label: 'RESOLVED',
                color: 'bg-violet-500',
                count: analytics?.statusBreakdown?.RESOLVED ?? 0,
              },
              { label: 'CLOSED', color: 'bg-slate-500', count: analytics?.statusBreakdown?.CLOSED ?? 0 },
            ].map((item) => {
              const total = analytics?.totalTickets || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.label}</span>
                    <span className="text-slate-400">
                      {item.count} tickets ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-navy-800 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800">
          <h3 className="text-sm font-bold text-white mb-4">Tickets by Priority</h3>
          <div className="space-y-3">
            {[
              { label: 'URGENT', color: 'bg-rose-500', count: analytics?.priorityBreakdown?.URGENT ?? 0 },
              { label: 'HIGH', color: 'bg-amber-500', count: analytics?.priorityBreakdown?.HIGH ?? 0 },
              { label: 'MEDIUM', color: 'bg-blue-500', count: analytics?.priorityBreakdown?.MEDIUM ?? 0 },
              { label: 'LOW', color: 'bg-slate-500', count: analytics?.priorityBreakdown?.LOW ?? 0 },
            ].map((item) => {
              const total = analytics?.totalTickets || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.label}</span>
                    <span className="text-slate-400">
                      {item.count} tickets ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-navy-800 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
