'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

export const FilterPopover = ({ 
    isOpen, 
    onClose, 
    pendingFilters, 
    setPendingFilters, 
    onApply 
}) => {
    if (!isOpen) return null;

    const togglePending = (category, value) => {
        setPendingFilters(prev => {
            const current = prev[category] || [];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: updated };
        });
    };

    const handleReset = () => {
        setPendingFilters({ type: [], access: [] });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-64 glass-strong border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em]">Filter Workspaces</h4>
                <button 
                    onClick={onClose}
                    className="text-text-muted hover:text-white transition-colors"
                >
                    <X size={14} />
                </button>
            </div>

            <div className="p-3 space-y-5">
                {/* Workspace Type Section */}
                <div>
                    <p className="text-[10px] font-bold text-text-secondary mb-2.5 px-1 uppercase tracking-wider">Workspace Type</p>
                    <div className="space-y-1">
                        {['Personal', 'Team'].map(type => {
                            const isSelected = pendingFilters.type.includes(type);
                            return (
                                <button
                                    key={type}
                                    onClick={() => togglePending('type', type)}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all duration-200 ${
                                        isSelected 
                                        ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' 
                                        : 'text-text-muted border border-transparent hover:bg-white/5 hover:text-text-primary'
                                    }`}
                                >
                                    <span className="font-medium">{type}</span>
                                    {isSelected && <CheckCircle2 size={14} className="animate-in zoom-in-50" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Access Level Section */}
                <div>
                    <p className="text-[10px] font-bold text-text-secondary mb-2.5 px-1 uppercase tracking-wider">Access Level</p>
                    <div className="space-y-1">
                        {['Private', 'Shared'].map(access => {
                            const isSelected = pendingFilters.access.includes(access);
                            return (
                                <button
                                    key={access}
                                    onClick={() => togglePending('access', access)}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all duration-200 ${
                                        isSelected 
                                        ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' 
                                        : 'text-text-muted border border-transparent hover:bg-white/5 hover:text-text-primary'
                                    }`}
                                >
                                    <span className="font-medium">{access}</span>
                                    {isSelected && <CheckCircle2 size={14} className="animate-in zoom-in-50" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-2 border-t border-white/5 bg-black/20 flex items-center justify-between gap-2">
                <button
                    onClick={handleReset}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors"
                >
                    Reset
                </button>
                <button
                    onClick={onApply}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-brand-primary text-brand-surface rounded-lg hover:bg-brand-glow transition-all shadow-glow-sm"
                >
                    Apply Filters
                </button>
            </div>
        </motion.div>
    );
};