'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, CheckCircle2, TerminalSquare } from 'lucide-react';
import { generateCurlFromConfig } from '@/utils/curlUtils';
import { useAppStore } from '@/store/useAppStore';

export default function GenerateCodeModal({ isOpen, onClose, requestConfig }) {
    const { getEnvVariable } = useAppStore();
    const [copied, setCopied] = useState(false);
    const [curlCode, setCurlCode] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen && requestConfig) {
            setCurlCode(generateCurlFromConfig(requestConfig, getEnvVariable));
        }
    }, [isOpen, requestConfig]);

    if (!isOpen || !mounted) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(curlCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const modalContent = (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-bg-panel border border-border-strong rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                <div className="px-6 py-4 border-b border-border-subtle bg-bg-base/50 flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <TerminalSquare size={18} className="text-emerald-500" />
                        Generate Code Snippet
                    </h3>
                    <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-bg-input transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-text-secondary">cURL (Bash)</span>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-input hover:bg-white/10 rounded border border-border-subtle text-xs font-medium text-text-primary transition-colors"
                        >
                            {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            {copied ? 'Copied!' : 'Copy Code'}
                        </button>
                    </div>

                    <pre className="w-full max-h-96 bg-[#0d0d0d] border border-border-subtle rounded-lg p-4 text-xs font-mono text-text-secondary overflow-auto custom-scrollbar whitespace-pre-wrap word-break">
                        {curlCode}
                    </pre>

                    <div className="flex justify-end mt-6 pt-4 border-t border-border-subtle">
                        <button onClick={onClose} className="px-6 py-2 text-sm font-bold bg-bg-input hover:bg-white/10 rounded-lg border border-border-subtle transition-colors">
                            Done
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}