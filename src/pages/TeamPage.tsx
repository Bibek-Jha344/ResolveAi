import React, { useState, useEffect } from 'react';
import { Users, Shield, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import { User, UserRole } from '../types';

interface TeamPageProps {
  currentUser: User | null;
}

export const TeamPage: React.FC<TeamPageProps> = ({ currentUser }) => {
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadTeam = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTeamMembers();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const updated = await api.updateUserRole(userId, newRole);
      setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, role: updated.role } : m)));
    } catch (err: any) {
      alert('Failed to update role: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Team & User Directory</h2>
          <p className="text-xs text-slate-400">
            Manage agents, administrators, and customer accounts with role-based access control.
          </p>
        </div>

        <button
          onClick={loadTeam}
          className="p-2.5 rounded-xl bg-navy-900 border border-navy-700 text-slate-400 hover:text-white transition flex items-center gap-2 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={loadTeam} className="underline text-white font-medium">
            Retry
          </button>
        </div>
      )}

      <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden shadow-card">
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            <span className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No team members found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950/60 border-b border-navy-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Created Date</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Modify Permission</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-navy-850/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-navy-800 border border-navy-700 flex items-center justify-center font-bold text-white text-xs">
                          {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="font-semibold text-white">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{member.email}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          member.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : member.role === 'AGENT'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={member.role}
                          disabled={updatingId === member.id || member.id === currentUser?.id}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-brand-500"
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="AGENT">AGENT</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                    )}
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
