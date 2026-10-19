import React, { useState } from 'react';
import {
  Shield,
  Users,
  Activity,
  Cpu,
  Database,
  Key,
  AlertCircle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Bell
} from 'lucide-react';

export const AdminWorkspace: React.FC = () => {
  const [users, setUsers] = useState([
    { id: 'usr-1', name: 'Dr. Evelyn Vance', email: 'evelyn@starai.dev', role: 'admin', status: 'active', requests: 4820 },
    { id: 'usr-2', name: 'Alex Thorne', email: 'alex@innovate.org', role: 'developer', status: 'active', requests: 1250 },
    { id: 'usr-3', name: 'Meera Raman', email: 'meera@chennai-edu.in', role: 'educator', status: 'active', requests: 840 },
    { id: 'usr-4', name: 'Guest Explorer', email: 'guest@starai.dev', role: 'user', status: 'active', requests: 45 },
  ]);

  const [announcement, setAnnouncement] = useState('STAR AI 2.5 Engine deployed. Grounded search verified.');
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
    );
  };

  const handleSaveAnnouncement = () => {
    setAnnouncementSaved(true);
    setTimeout(() => setAnnouncementSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080D1B] overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#35D7FF]/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#35D7FF]/10 border border-[#35D7FF]/20 text-xs font-bold text-[#35D7FF] mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>STAR ADMINISTRATION CONSOLE</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              System Operations & Telemetry
            </h2>
            <p className="text-xs text-[#98A3B8]">
              Role-based access control, Gemini API throughput, service health, and security auditing.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>All Systems Nominal</span>
          </div>
        </div>

        {/* Telemetry Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-[#111B35]/80 border border-[#35D7FF]/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-[#98A3B8]">
              <span>Active Model</span>
              <Cpu className="w-4 h-4 text-[#35D7FF]" />
            </div>
            <div className="text-lg font-bold text-white">gemini-3.8-flash</div>
            <div className="text-[11px] text-[#35D7FF]">42ms inference median</div>
          </div>

          <div className="p-4 rounded-xl bg-[#111B35]/80 border border-[#35D7FF]/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-[#98A3B8]">
              <span>Search Grounding</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-white">99.98% Uptime</div>
            <div className="text-[11px] text-emerald-400">Google Search Index Connected</div>
          </div>

          <div className="p-4 rounded-xl bg-[#111B35]/80 border border-[#35D7FF]/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-[#98A3B8]">
              <span>PostgreSQL Cluster</span>
              <Database className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <div className="text-lg font-bold text-white">Cloud SQL Pool</div>
            <div className="text-[11px] text-[#8B5CF6]">Active Connections: 14</div>
          </div>

          <div className="p-4 rounded-xl bg-[#111B35]/80 border border-[#35D7FF]/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-[#98A3B8]">
              <span>Security Audits</span>
              <Lock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-lg font-bold text-white">Zero Anomalies</div>
            <div className="text-[11px] text-cyan-400">CSRF & Rate Limiting Enforced</div>
          </div>
        </div>

        {/* User Management & Role Control */}
        <div className="p-5 rounded-2xl bg-[#111B35]/80 border border-[#35D7FF]/20 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#35D7FF]" />
              <span>User & Role Governance</span>
            </h3>
            <span className="text-xs text-[#98A3B8]">4 Registered Accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080D1B] text-[#98A3B8] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">API Calls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold text-white">{u.name}</td>
                    <td className="p-3 text-[#98A3B8] font-mono">{u.email}</td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-[#080D1B] border border-[#35D7FF]/20 rounded-lg px-2 py-1 text-white outline-none cursor-pointer"
                      >
                        <option value="user">User</option>
                        <option value="developer">Developer</option>
                        <option value="educator">Educator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-white">{u.requests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Announcement Banner Control */}
        <div className="p-5 rounded-2xl bg-[#111B35]/80 border border-[#35D7FF]/20 space-y-3 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Platform Maintenance & Global Announcement</span>
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="flex-1 bg-[#080D1B] border border-[#35D7FF]/20 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#35D7FF]"
            />
            <button
              onClick={handleSaveAnnouncement}
              className="px-4 py-2 rounded-xl bg-[#35D7FF] text-[#080D1B] font-bold text-xs hover:brightness-110 active:scale-95 transition-all"
            >
              {announcementSaved ? 'Broadcasted' : 'Broadcast Announcement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
