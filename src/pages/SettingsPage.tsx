import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Activity,
  Server,
  Key,
  Globe,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { api, API_BASE_URL } from '../api';
import { User, SystemHealth } from '../types';

interface SettingsPageProps {
  currentUser: User | null;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSystemHealth();
      setHealth(data);
    } catch {
      setHealth({
        status: 'DOWN',
        database: 'DISCONNECTED',
        vectorStore: 'FALLBACK',
        aiProvider: 'UNCONFIGURED',
        aiProviderName: 'None',
        version: '1.0.0-offline',
        uptimeSeconds: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Platform Settings & Diagnostics</h2>
        <p className="text-xs text-slate-400">
          Inspect backend connectivity, environment variables, AI credentials status, and user profile.
        </p>
      </div>

      {/* System Diagnostics Card */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4 shadow-card">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white">System Health & Diagnostic Telemetry</h3>
          </div>
          <button
            onClick={checkHealth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
            title="Ping health check"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              Spring Boot API:
            </span>
            <span
              className={`font-semibold ${
                health?.status === 'UP' ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {health?.status || 'CHECKING...'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-navy-850 border border-navy-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              PostgreSQL DB:
            </span>
            <span
              className={`font-semibold ${
                health?.database === 'CONNECTED' ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {health?.database || 'DISCONNECTED'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-navy-850 border border-navy-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-slate-500" />
              Vector Engine:
            </span>
            <span className="font-semibold text-brand-300">
              {health?.vectorStore === 'AVAILABLE' ? 'pgvector Cosine' : 'In-Memory Cosine Fallback'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-navy-850 border border-navy-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              Active LLM Provider:
            </span>
            <span className="font-semibold text-slate-200">
              {health?.aiProviderName || 'Local Deterministic Fallback'}
            </span>
          </div>
        </div>

        <div className="pt-2 text-[11px] text-slate-500 font-mono">
          Endpoint: <span className="text-slate-300">{API_BASE_URL}</span>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-navy-800 pb-3">User Profile</h3>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-navy-800/60">
            <span className="text-slate-400">Full Name</span>
            <span className="text-white font-medium">{currentUser?.name}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-navy-800/60">
            <span className="text-slate-400">Account Email</span>
            <span className="text-white font-mono">{currentUser?.email}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-navy-800/60">
            <span className="text-slate-400">Assigned Role</span>
            <span className="text-brand-300 font-semibold">{currentUser?.role}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Account ID</span>
            <span className="text-slate-400 font-mono text-[11px]">{currentUser?.id}</span>
          </div>
        </div>
      </div>

      {/* Security & Deployment Notice */}
      <div className="p-4 rounded-xl bg-navy-850 border border-navy-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Shield className="w-4 h-4 text-accent-violet" />
          <span>Security & API Configuration Guide</span>
        </div>
        <p className="leading-relaxed">
          AI Provider API keys (e.g. OpenAI, Anthropic, or HuggingFace) are securely kept on the Spring Boot backend
          via environment variables (<code className="text-brand-300">AI_API_KEY</code>) and are never leaked to frontend browser bundles.
        </p>
      </div>
    </div>
  );
};
