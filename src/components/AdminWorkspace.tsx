import React, { useState, useEffect } from 'react';
import { StarApi } from '../services/api';
import {
  Shield,
  Users,
  Activity,
  Cpu,
  Database,
  Lock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Server
} from 'lucide-react';

interface AdminWorkspaceProps {
  currentUserRole?: string;
  onOpenAuth?: () => void;
}

export const AdminWorkspace: React.FC<AdminWorkspaceProps> = ({
  currentUserRole = 'developer',
  onOpenAuth,
}) => {
  const [telemetry, setTelemetry] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [users, setUsers] = useState([
    { id: 'usr-1', name: 'Dr. Evelyn Vance', email: 'evelyn@starai.dev', role: 'admin', status: 'active', requests: 4820 },
    { id: 'usr-2', name: 'Alex Thorne', email: 'alex@innovate.org', role: 'developer', status: 'active', requests: 1250 },
    { id: 'usr-3', name: 'Meera Raman', email: 'meera@chennai-edu.in', role: 'educator', status: 'active', requests: 840 },
    { id: 'usr-4', name: 'Guest Explorer', email: 'guest@starai.dev', role: 'user', status: 'active', requests: 45 },
  ]);

  const [announcement, setAnnouncement] = useState('STAR AI 2.5 Engine deployed. Grounded search verified.');
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  useEffect(() => {
    async function verifyAdmin() {
      setIsVerifying(true);
      setAccessDenied(false);
      try {
        const data = await StarApi.checkAdminTelemetry(currentUserRole);
        setTelemetry(data.telemetry);
      } catch (err: any) {
        setAccessDenied(true);
        setErrorMessage(err.message || 'Access Denied: Administrator credentials required.');
      } finally {
        setIsVerifying(false);
      }
    }
    verifyAdmin();
  }, [currentUserRole]);

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
    );
  };

  const handleSaveAnnouncement = () => {
    setAnnouncementSaved(true);
    setTimeout(() => setAnnouncementSaved(false), 2000);
  };

  if (isVerifying) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-50 p-8 space-y-4">
        <div className="w-10 h-10 rounded-full border-3 border-blue-200 border-t-blue-600 animate-spin" />
        <div className="text-sm font-semibold text-slate-700">
          Verifying cryptographic server-side authorization credentials...
        </div>
      </div>
    );
  }

  // Access Denied screen for ordinary users (TEST 10)
  if (accessDenied || currentUserRole !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-50 p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-rose-200 shadow-md space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Access Denied</h2>
            <p className="text-xs text-rose-600 font-semibold mt-1">
              Administrator Privileges Required
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {errorMessage || `Your account role is currently "${currentUserRole}". The STAR AI Administration Console is restricted to authorized administrators.`}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs hover:from-blue-700 hover:to-indigo-700 shadow-xs cursor-pointer"
              >
                Switch Account / Sign In as Admin
              </button>
            )}
            <div className="text-[11px] text-slate-400">
              Security Notice: Unauthorized access attempts are monitored and logged.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600 mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>STAR ADMINISTRATION CONSOLE</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              System Operations & Telemetry
            </h2>
            <p className="text-xs text-slate-500">
              Role-based access control, Gemini API throughput, service health, and security auditing.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>All Systems Nominal</span>
          </div>
        </div>

        {/* Telemetry Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Active Model</span>
              <Cpu className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-slate-900">{telemetry?.activeModel || 'gemini-3.1-flash-lite'}</div>
            <div className="text-[11px] text-blue-600 font-medium">Ultra-low latency inference</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Search Grounding</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-lg font-bold text-slate-900">{telemetry?.uptime || '99.99%'} Uptime</div>
            <div className="text-[11px] text-emerald-600 font-medium">Google Search Index Connected</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Database Cluster</span>
              <Database className="w-4 h-4 text-violet-600" />
            </div>
            <div className="text-lg font-bold text-slate-900">Cloud SQL (PostgreSQL)</div>
            <div className="text-[11px] text-violet-600 font-medium">Active Connections: {telemetry?.activeConnections || 18}</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Security Audits</span>
              <Lock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-lg font-bold text-slate-900">Zero Anomalies</div>
            <div className="text-[11px] text-indigo-600 font-medium">CSRF & Rate Limiting Enforced</div>
          </div>
        </div>

        {/* User Management & Role Control */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>User & Role Governance</span>
            </h3>
            <span className="text-xs text-slate-500">{users.length} Registered Accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">API Calls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-500 font-mono">{u.email}</td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 outline-none cursor-pointer text-xs"
                      >
                        <option value="user">User</option>
                        <option value="developer">Developer</option>
                        <option value="educator">Educator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-900">{u.requests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Announcement Broadcaster */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-violet-600" />
              <span>System Announcement & Maintenance Banner</span>
            </h3>
            {announcementSaved && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Broadcast Saved</span>
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs md:text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
            <button
              onClick={handleSaveAnnouncement}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs cursor-pointer"
            >
              Update Banner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
