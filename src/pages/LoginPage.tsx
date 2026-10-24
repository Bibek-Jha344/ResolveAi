import React, { useState } from 'react';
import { Headphones, Lock, Mail, ArrowRight, AlertCircle, Shield, UserCheck } from 'lucide-react';
import { api } from '../api';
import { User } from '../types';

interface LoginPageProps {
  onSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateToRegister,
  onBackToHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const auth = await api.login(email, password);
      onSuccess(auth.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials or ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (role: 'ADMIN' | 'AGENT' | 'CUSTOMER') => {
    if (role === 'ADMIN') {
      setEmail('admin@resolveai.io');
      setPassword('admin123');
    } else if (role === 'AGENT') {
      setEmail('agent@resolveai.io');
      setPassword('agent123');
    } else {
      setEmail('customer@resolveai.io');
      setPassword('customer123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-grid-pattern relative">
      <div className="absolute top-10 left-6 sm:left-12">
        <button
          onClick={onBackToHome}
          className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5"
        >
          &larr; Back to ResolveAI
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-violet mx-auto flex items-center justify-center shadow-glow mb-4">
          <Headphones className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign in to your account</h2>
        <p className="mt-2 text-xs text-slate-400">
          Or{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4"
          >
            create a new customer or team account
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-navy-900 border border-navy-700/80 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-sm text-white focus:outline-none focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-sm text-white focus:outline-none focus:border-brand-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold text-sm shadow-glow-sm transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for Fast Review */}
          <div className="mt-6 pt-5 border-t border-navy-800">
            <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider mb-2.5">
              Quick Demo Logins (Pre-seeded)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('ADMIN')}
                className="px-2.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 border border-navy-700 text-[11px] text-slate-300 hover:text-white transition font-medium text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('AGENT')}
                className="px-2.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 border border-navy-700 text-[11px] text-slate-300 hover:text-white transition font-medium text-center"
              >
                Agent
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('CUSTOMER')}
                className="px-2.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 border border-navy-700 text-[11px] text-slate-300 hover:text-white transition font-medium text-center"
              >
                Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
