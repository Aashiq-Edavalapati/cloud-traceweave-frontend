'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export const FilterPopover = ({ isOpen, onClose, pendingFilters, setPendingFilters, onApply }) => {
    if (!isOpen) return null;

    const togglePending = (category, value) => {
        setPendingFilters(prev => {
            const current = prev[category];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: updated };
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-64 bg-bg-panel border border-border-strong rounded-lg shadow-2xl z-50 overflow-hidden"
        >
            <div className="p-3 border-b border-border-subtle bg-bg-sidebar/50">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Filter View</h4>
            </div>

            <div className="p-2 space-y-4">
                <div>
                    <p className="text-[11px] text-text-secondary mb-2 px-2 font-medium">Workspace Type</p>
                    <div className="space-y-1">
                        {['Team', 'Personal', 'Public'].map(type => (
                            <button
                                key={type}
                                onClick={() => togglePending('type', type)}
                                className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-md transition-colors ${pendingFilters.type.includes(type) ? 'bg-brand-orange/10 text-brand-orange' : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
                                    }`}
                            >
                                <span>{type}</span>
                                {pendingFilters.type.includes(type) && <CheckCircle2 size={12} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-[11px] text-text-secondary mb-2 px-2 font-medium">Access Level</p>
                    <div className="space-y-1">
                        {['Private', 'Restricted', 'Public'].map(access => (
                            <button
                                key={access}
                                onClick={() => togglePending('access', access)}
                                className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-md transition-colors ${pendingFilters.access.includes(access) ? 'bg-brand-blue/10 text-brand-blue' : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
                                    }`}
                            >
                                <span>{access}</span>
                                {pendingFilters.access.includes(access) && <CheckCircle2 size={12} />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-2 border-t border-border-subtle bg-bg-sidebar/30 flex justify-between gap-2">
                <button
                    onClick={() => {
                        setPendingFilters({ type: [], access: [] });
                    }}
                    className="px-3 py-1 text-xs text-text-muted hover:text-text-primary"
                >
                    Reset
                </button>
                <button
                    onClick={onApply}
                    className="px-4 py-1.5 text-xs bg-brand-orange text-white rounded hover:bg-orange-600 font-medium transition-colors"
                >
                    Apply Filters
                </button>
            </div>
        </motion.div>
    );
};