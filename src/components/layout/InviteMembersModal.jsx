'use client';
import { useState } from 'react';
import { X, Mail, UserPlus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function InviteMembersModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('VIEWER');
  const { workspaceMembers, inviteMember, invitationError } = useAppStore();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      const result = await inviteMember(email, role.toUpperCase());
      if (result?.success) {
        setEmail('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-bg-panel border border-border-strong rounded-xl shadow-2xl w-[500px] overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-bg-base">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <UserPlus size={16} className="text-brand-primary" />
            Manage Access
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><X size={18} /></button>
        </div>

        {/* Invite Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <Mail size={14} className="absolute left-3 top-2.5 text-text-muted" />
              <input
                type="email"
                placeholder="teammate@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-input border border-border-subtle rounded py-2 pl-9 pr-3 text-sm text-text-primary focus:border-brand-primary outline-none placeholder:text-text-muted"
                required
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-bg-input border border-border-subtle rounded px-3 text-sm text-text-primary outline-none"
            >
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
              <option value="OWNER">Owner</option>
            </select>
            <button className="bg-brand-primary text-brand-surface text-xs font-black px-4 py-2 rounded hover:bg-brand-glow transition shadow-glow-sm">
              Invite
            </button>
          </form>

          {invitationError && (
            <div className="mb-4 p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-500 font-medium">
              {invitationError}
            </div>
          )}

          {/* Member List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Current Members</div>
            {workspaceMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-2 rounded hover:bg-bg-input group transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs text-white font-bold">
                    {member.user?.fullName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="text-sm text-text-primary font-medium">{member.user?.fullName || 'Unknown User'}</div>
                    <div className="text-xs text-text-secondary">{member.user?.email || 'No email provided'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-bg-base border border-border-subtle px-2 py-0.5 rounded text-text-secondary uppercase">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
