'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

export default function UnsavedChangesModal({ 
    isOpen, 
    onClose,      // Triggered by 'Cancel' or X
    onDiscard,    // Triggered by 'Don't Save'
    onSave,       // Triggered by 'Save'
    itemName = 'this item' 
}) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
            {/* Modal Content */}
            <div className="w-[480px] bg-bg-panel border border-border-strong rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border-subtle">
                    <div className="flex items-center gap-2 text-text-primary font-semibold">
                        <AlertTriangle className="text-amber-500" size={20} />
                        <span>Unsaved Changes</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-text-secondary hover:text-text-primary p-1 rounded hover:bg-bg-input transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-sm text-text-secondary leading-relaxed">
                    Do you want to save the changes you made to <span className="font-semibold text-text-primary">&quot;{itemName}&quot;</span>?
                    <br />
                    Your changes will be lost if you don&apos;t save them.
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 bg-bg-base/50 border-t border-border-subtle rounded-b-lg">
                    <button 
                        onClick={onDiscard}
                        className="px-4 py-2 text-xs font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                        Don&apos;t Save
                    </button>
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-input rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onSave}
                        className="px-4 py-2 text-xs font-bold text-white bg-brand-primary hover:bg-brand-glow rounded shadow-sm transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
