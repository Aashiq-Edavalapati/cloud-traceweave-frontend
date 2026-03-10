'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Network, Loader2, Edit3 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const CreateWorkspaceModal = ({ isOpen, onClose, onSuccess, editData = null }) => {
    const { createWorkspace, updateWorkspace } = useAppStore();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEdit = !!editData;

    useEffect(() => {
        if (isOpen) {
            setName(editData?.name || '');
            setDescription(editData?.description || '');
            setError('');
        }
    }, [isOpen, editData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        setError('');

        let result;
        if (isEdit) {
            result = await updateWorkspace(editData.id, { name, description });
        } else {
            result = await createWorkspace(name, description);
        }
        
        setIsLoading(false);

        if (result.success) {
            onClose();
            if (onSuccess) onSuccess(result.workspace || editData);
        } else {
            setError(result.error || 'Failed to create workspace');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-bg-panel border border-border-subtle rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                        {isEdit ? <Edit3 size={20} /> : <Network size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-text-primary">{isEdit ? 'Edit Workspace' : 'Create Workspace'}</h3>
                                        <p className="text-xs text-text-secondary">{isEdit ? 'Update workspace details' : 'Set up a new collaborative environment'}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            {error && (
                                <div className="p-3 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">{error}</div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Workspace Name</label>
                                    <input autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-bg-input border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary transition-all text-sm text-text-primary" required />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Description</label>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-bg-input border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary transition-all text-sm text-text-primary resize-none" />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-border-subtle text-sm font-semibold text-text-secondary hover:bg-white/5 transition-all">Cancel</button>
                                    <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2.5 bg-brand-primary hover:bg-brand-glow text-brand-surface text-sm font-black rounded-lg transition-all shadow-glow-sm flex items-center justify-center gap-2">
                                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : (isEdit ? 'Save Changes' : 'Create Workspace')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};