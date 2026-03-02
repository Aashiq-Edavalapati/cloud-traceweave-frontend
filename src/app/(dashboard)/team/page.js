'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useModal } from '@/components/providers/ModalProvider';
import { Users, Mail, ShieldAlert, ShieldCheck, User as UserIcon, Building, Trash2, Clock, CheckCircle2, Copy, RefreshCw } from 'lucide-react';

export default function TeamPage() {
  const { user } = useAuthStore();
  const { showConfirm } = useModal();

  const { 
    availableWorkspaces, 
    activeWorkspaceId, 
    setActiveWorkspace,
    workspaceMembers,
    pendingInvites,
    removeMember,
    updateMemberRole,
    fetchWorkspaces,
    fetchPendingInvites,
    createWorkspaceInvite,
    leaveWorkspace
  } = useAppStore();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteTab, setInviteTab] = useState('email');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('VIEWER');
  
  // Modal states for the magic link
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (availableWorkspaces.length === 0) fetchWorkspaces();
  }, []);

  // Fetch pending invites when workspace changes
  useEffect(() => {
    if (activeWorkspaceId) fetchPendingInvites(activeWorkspaceId);
  }, [activeWorkspaceId]);

  const activeWorkspace = availableWorkspaces.find(ws => ws.id === activeWorkspaceId);
  const myRole = workspaceMembers.find(m => m.userId === user?.id)?.role || 'VIEWER';
  const canManage = myRole === 'OWNER' || myRole === 'EDITOR';

  const handleRoleChange = async (userId, newRole) => {
    await updateMemberRole(userId, newRole);
  };

  const handleRemove = (userId) => {
    showConfirm(
      "Are you sure you want to remove this member? They will immediately lose access to all collections and environments in this workspace.",
      async () => {
        await removeMember(userId);
      },
      "Remove Team Member"
    );
  };

  const handleLeave = () => {
    showConfirm(
      "Are you sure you want to leave this workspace? You will lose access to all its data and will need a new invite to join back.",
      async () => {
        const res = await leaveWorkspace(activeWorkspaceId);
        if (res.success) {
          // Optional: Add an alert or toast here
        }
      },
      "Leave Workspace"
    );
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setGeneratedLink('');

    const res = await createWorkspaceInvite(inviteEmail, inviteRole);
    if (res.success) {
      setGeneratedLink('sent');
      setInviteEmail('');
      fetchPendingInvites(activeWorkspaceId);
    } else {
      setErrorMsg(res.error);
    }
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetModal = () => {
    setIsInviteModalOpen(false);
    setInviteEmail('');
    setGeneratedLink('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col md:flex-row max-w-7xl mx-auto w-full">
      
      {/* LEFT COLUMN: Workspace Selector */}
      <div className="w-full md:w-64 border-r border-border-subtle p-6 flex flex-col gap-4 bg-bg-panel/30">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Building size={18} className="text-brand-primary" />
            Directories
          </h2>
          <div className="space-y-1">
            {availableWorkspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspace(ws.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                  activeWorkspaceId === ws.id 
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' 
                    : 'text-text-secondary hover:bg-bg-input hover:text-text-primary border border-transparent'
                }`}
              >
                <span className="truncate">{ws.name}</span>
                <span className="text-[10px] bg-bg-base px-1.5 py-0.5 rounded border border-border-subtle text-text-muted">
                  {ws.members?.length || 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Team Roster & Invites */}
      <div className="flex-1 p-6 md:p-10 flex flex-col overflow-y-auto custom-scrollbar">
        {activeWorkspace ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-3 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Home
                </Link>

                <h1 className="text-3xl font-bold tracking-tight">
                  {activeWorkspace.name} Team
                </h1>
                <p className="text-text-secondary text-sm mt-1">
                  Manage access and roles for this workspace.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Only show Leave button if user is NOT the owner */}
                {myRole !== 'OWNER' && (
                  <button
                    onClick={handleLeave}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-border-subtle hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all"
                  >
                    <Trash2 size={16} /> Leave Workspace
                  </button>
                )}

                {canManage && (
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-primary text-brand-surface px-5 py-2.5 rounded-lg text-sm font-black hover:bg-brand-glow transition-all shadow-glow-sm"
                  >
                    <Mail size={16} /> Invite Member
                  </button>
                )}
              </div>
            </div>

            {/* ACTIVE MEMBERS TABLE */}
            <div className="bg-bg-panel border border-border-subtle rounded-xl overflow-hidden shadow-sm mb-8">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-bg-base/50 text-text-muted border-b border-border-subtle uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {/* {console.log(workspaceMembers)} */}
                  {workspaceMembers.map((member) => (
                    <tr key={member.id} className={`${member.userId === user?.id ? 'bg-brand-primary/10' : ''} hover:bg-white/5 transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-primary flex items-center justify-center text-white font-bold text-xs">
                            {member.user?.fullName?.charAt(0) || member.user?.email?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary">
                              {member.user?.fullName || 'Unknown User'} {member.userId === user?.id && '(You)'}
                            </p>
                            <p className="text-xs text-text-muted">{member.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {canManage && myRole === 'OWNER' && member.userId !== user?.id ? (
                          <select 
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                            className="bg-bg-input border border-border-subtle rounded-md text-xs py-1.5 px-2 focus:outline-none focus:border-brand-primary text-text-secondary"
                          >
                            <option value="VIEWER">Viewer</option>
                            <option value="EDITOR">Editor</option>
                            <option value="OWNER">Owner</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            {member.role === 'OWNER' && <ShieldAlert size={14} className="text-brand-primary" />}
                            {member.role === 'EDITOR' && <ShieldCheck size={14} className="text-emerald-500" />}
                            {member.role === 'VIEWER' && <UserIcon size={14} className="text-text-muted" />}
                            <span className={member.role === 'OWNER' ? 'text-brand-primary' : 'text-text-secondary'}>
                              {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canManage && member.userId !== user?.id && myRole === 'OWNER' && (
                          <button 
                            onClick={() => handleRemove(member.userId)}
                            className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PENDING INVITES TABLE */}
            {pendingInvites.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-secondary">
                  <Clock size={18} /> Pending Invites
                </h3>
                <div className="bg-bg-panel border border-border-subtle rounded-xl overflow-hidden shadow-sm opacity-80">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-bg-base/50 text-text-muted border-b border-border-subtle uppercase tracking-wider text-[11px] font-semibold">
                      <tr>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Invited By</th>
                        <th className="px-6 py-3">Expires</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {pendingInvites.map((invite) => (
                        <tr key={invite.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 font-medium text-text-primary">{invite.email}</td>
                          <td className="px-6 py-3 text-xs text-text-secondary">{invite.role}</td>
                          <td className="px-6 py-3 text-xs text-text-muted">{invite.inviter?.fullName || 'Unknown'}</td>
                          <td className="px-6 py-3 text-xs text-brand-primary">
                            {new Date(invite.expiresAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
            <Users size={48} className="mb-4 opacity-20" />
            <p>Select a workspace to manage its team</p>
          </div>
        )}
      </div>


      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-bg-panel border border-border-strong rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header & Tabs */}
            <div className="px-6 pt-6 pb-4 border-b border-border-subtle bg-bg-base/50">
                <h3 className="text-lg font-bold mb-4">Share {activeWorkspace?.name}</h3>
                <div className="flex gap-4 text-sm font-medium">
                <button 
                    onClick={() => setInviteTab('email')}
                    className={`pb-2 border-b-2 transition-colors ${inviteTab === 'email' ? 'border-brand-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}
                >
                    Invite via Email
                </button>
                <button 
                    onClick={() => setInviteTab('link')}
                    className={`pb-2 border-b-2 transition-colors ${inviteTab === 'link' ? 'border-brand-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}
                >
                    Invite Link
                </button>
                </div>
            </div>

            <div className="p-6">
                {/* --- TAB 1: EMAIL --- */}
                {inviteTab === 'email' && (
                <form onSubmit={handleSendInvite} className="space-y-4">
                    <p className="text-sm text-text-secondary mb-4">Send a direct email invitation with specific role access.</p>
                    {errorMsg && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-md">{errorMsg}</div>}
                    {generatedLink === 'sent' && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs rounded-md">Invitation sent successfully!</div>}
                    
                    <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Email Address</label>
                    <input 
                        type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                        className="w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" 
                        placeholder="colleague@example.com"
                    />
                    </div>
                    <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Role</label>
                    <select 
                        value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                        className="w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                    >
                        <option value="VIEWER">Viewer</option>
                        <option value="EDITOR">Editor</option>
                        {myRole === 'OWNER' && <option value="OWNER">Owner</option>}
                    </select>
                    </div>
                    <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-border-subtle">
                    <button type="button" onClick={resetModal} className="px-4 py-2 text-sm font-medium hover:bg-bg-input rounded-lg">Done</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-black bg-brand-primary text-brand-surface rounded-lg hover:bg-brand-glow disabled:opacity-50 shadow-glow-sm">
                        {isLoading ? 'Sending...' : 'Send Invite'}
                    </button>
                    </div>
                </form>
                )}

                {/* --- TAB 2: COMMON LINK --- */}
                {inviteTab === 'link' && (
                <div className="space-y-4">
                    <p className="text-sm text-text-secondary mb-4">Anyone with this link can join the workspace as a Viewer.</p>
                    
                    <div className="flex items-center justify-between p-3 border border-border-subtle rounded-lg bg-bg-input">
                    <div>
                        <p className="text-sm font-bold text-text-primary">Enable Link Sharing</p>
                        <p className="text-xs text-text-muted">Turn off to invalidate existing links.</p>
                    </div>
                    <button 
                        onClick={() => useAppStore
                        .getState()
                        .toggleCommonLink(!activeWorkspace.isInviteLinkActive)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${activeWorkspace?.isInviteLinkActive ? 'bg-emerald-500' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${activeWorkspace?.isInviteLinkActive ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                    </div>

                    {activeWorkspace?.isInviteLinkActive && (
                    <div className="animate-in fade-in slide-in-from-top-2 space-y-3 mt-4">
                        <div className="flex items-center gap-2 bg-bg-base border border-border-subtle rounded-lg p-2">
                        <input 
                            type="text" readOnly 
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${activeWorkspace.inviteToken}`} 
                            className="bg-transparent text-xs font-mono w-full outline-none text-text-secondary pl-2"
                        />
                        <button 
                            onClick={() => {
                            navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${activeWorkspace.inviteToken}`);
                            setCopied(true); setTimeout(() => setCopied(false), 2000);
                            }}
                            className="p-1.5 bg-bg-panel hover:bg-white/10 rounded border border-border-subtle text-text-primary transition-colors flex items-center gap-1 shrink-0"
                        >
                            {copied ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Copy size={14} />}
                        </button>
                        </div>
                        
                        <button 
                        onClick={() => useAppStore.getState().resetCommonLink()}
                        className="flex items-center gap-2 text-xs text-text-muted hover:text-brand-primary transition-colors px-1"
                        >
                        <RefreshCw size={12} /> Generate new link
                        </button>
                    </div>
                    )}
                    
                    <div className="flex justify-end mt-6 pt-4 border-t border-border-subtle">
                    <button type="button" onClick={resetModal} className="px-4 py-2 text-sm font-medium hover:bg-bg-input rounded-lg">Close</button>
                    </div>
                </div>
                )}
            </div>
            </div>
        </div>
        )}

    </div>
  );
}
