'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useModal } from '@/components/providers/ModalProvider';
import { Settings2, Trash2, Save, ShieldAlert, Loader2 } from 'lucide-react';
import { workspaceApi } from '@/api/workspace.api';
import { useRouter } from 'next/navigation';

export default function WorkspaceSettings() {
    const { activeWorkspaceId, availableWorkspaces, fetchWorkspaces } = useAppStore();
    const { user } = useAuthStore();
    const { showConfirm } = useModal();
    const router = useRouter();

    const workspace = availableWorkspaces.find(w => w.id === activeWorkspaceId);
    
    const [name, setName] = useState(workspace?.name || '');
    const [desc, setDesc] = useState(workspace?.description || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const hasChanges = name !== (workspace?.name || '') || desc !== (workspace?.description || '');

    const handleUpdate = async () => {
        if (!name.trim()) return;
        try {
            setIsSaving(true);
            await workspaceApi.updateWorkspace(activeWorkspaceId, {
                name: name.trim(),
                description: desc.trim()
            });
            await fetchWorkspaces();
        } catch (error) {
            console.error('Failed to update workspace:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = () => {
        showConfirm(
            'Are you sure you want to delete this workspace? This action cannot be undone and all data will be lost.',
            handleDelete,
            'Delete Workspace'
        );
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await workspaceApi.deleteWorkspace(activeWorkspaceId);
            await fetchWorkspaces();
            router.push('/');
        } catch (error) {
            console.error('Failed to delete workspace:', error);
            setIsDeleting(false);
        }
    };

    if (!workspace) return null;

    const isOwner = workspace.ownerId === user?.id;

    return (
        <div className="h-full w-full overflow-y-auto custom-scrollbar bg-bg-base text-text-primary">
            <div className="max-w-4xl mx-auto p-6 md:p-10 lg:p-12 flex flex-col gap-10 pb-24">
                
                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Settings2 size={28} className="text-brand-primary" />
                        Workspace Settings
                    </h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Manage your workspace configuration, members, and billing.
                    </p>
                </div>

                {/* General Settings Card */}
                <div className="bg-bg-panel border border-border-subtle rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-border-subtle bg-bg-base/50">
                        <h2 className="font-semibold text-sm tracking-wide text-text-primary">General Information</h2>
                    </div>
                    <div className="p-6 flex flex-col gap-6">
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Workspace Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={!isOwner}
                                className="w-full bg-bg-input border border-border-subtle rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Description</label>
                            <textarea
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                disabled={!isOwner}
                                className="w-full bg-bg-input border border-border-subtle rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none transition-all h-24 resize-none custom-scrollbar disabled:opacity-50"
                            />
                        </div>
                        
                        {isOwner && (
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handleUpdate}
                                    disabled={isSaving || !name.trim() || !hasChanges}
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-bold transition-all border border-white/5"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Danger Zone Section */}
                {isOwner && (
                    <div className="border border-red-500/30 rounded-xl overflow-hidden bg-red-500/5">
                        <div className="px-6 py-4 border-b border-red-500/20 flex items-center gap-2">
                            <ShieldAlert size={16} className="text-red-400" />
                            <h2 className="font-semibold text-sm tracking-wide text-red-400">Danger Zone</h2>
                        </div>
                        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="flex-1">
                                <h3 className="font-bold text-text-primary text-sm">Delete Workspace</h3>
                                <p className="text-xs text-text-muted mt-1 max-w-md leading-relaxed">
                                    Once you delete a workspace, there is no going back. All collections, environments, and execution history will be permanently destroyed.
                                </p>
                            </div>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="whitespace-nowrap flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50 px-5 py-2.5 rounded-lg text-sm font-bold transition-all border border-red-500/20 hover:border-red-500"
                            >
                                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                Delete Workspace
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}