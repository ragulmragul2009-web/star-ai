import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  X,
  User,
  Lock,
  Mail,
  Shield,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  const [mode, setMode] = useState<'profile' | 'signin' | 'signup'>('profile');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(currentUser.name);
  const [selectedRole, setSelectedRole] = useState(currentUser.role);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name,
      role: selectedRole,
    });
    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      onClose();
    }, 1200);
  };

  const handleQuickRoleSwitch = (r: UserProfile['role']) => {
    setSelectedRole(r);
    onUpdateUser({
      ...currentUser,
      role: r,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#111B35] border border-[#35D7FF]/30 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#35D7FF]/15 flex items-center justify-between bg-[#080D1B]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#35D7FF]" />
            <h3 className="text-base font-extrabold text-white">
              {mode === 'profile' ? 'User Profile & Identity' : 'Account Authentication'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#98A3B8] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {mode === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#080D1B] border border-[#35D7FF]/20">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#35D7FF] to-[#8B5CF6] flex items-center justify-center text-[#080D1B] font-extrabold text-lg">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{name}</div>
                  <div className="text-xs text-[#35D7FF] capitalize">{selectedRole} Account</div>
                  <div className="text-[10px] text-[#98A3B8]">{currentUser.email}</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#98A3B8]">Display Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080D1B] border border-[#35D7FF]/20 rounded-xl px-4 py-2 text-xs text-white placeholder-[#98A3B8]/50 focus:outline-none focus:border-[#35D7FF]"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#98A3B8]">Active Role Persona:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'user' as const, label: 'Explorer User' },
                    { id: 'developer' as const, label: 'AI Developer' },
                    { id: 'educator' as const, label: 'Educator & Tutor' },
                    { id: 'admin' as const, label: 'System Admin' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleQuickRoleSwitch(r.id)}
                      className={`p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                        selectedRole === r.id
                          ? 'bg-[#35D7FF]/20 border-[#35D7FF] text-white font-bold'
                          : 'bg-[#080D1B] border-white/5 text-[#98A3B8] hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Google Sign In */}
              <button
                type="button"
                onClick={() => {
                  setName('Google Authenticated User');
                  setEmail('user@gmail.com');
                  setSuccessNotice(true);
                  setTimeout(() => setSuccessNotice(false), 1500);
                }}
                className="w-full py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 flex items-center justify-center gap-2 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] text-[#080D1B] font-bold text-xs hover:brightness-110 active:scale-95 transition-all"
              >
                {successNotice ? 'Profile Updated!' : 'Save Profile Changes'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
