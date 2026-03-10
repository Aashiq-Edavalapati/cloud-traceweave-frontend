'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, CheckCircle2, TerminalSquare, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { generateCurlFromConfig, generatePowerShellFromConfig, parseCurlToConfig } from '@/utils/curlUtils';
import { useAppStore } from '@/store/useAppStore';

export default function CurlManagerModal({ isOpen, onClose, requestConfig }) {
    const { updateActiveRequest, getEnvVariable } = useAppStore();
    const [activeTab, setActiveTab] = useState('export'); // 'export' | 'import'

    // Export State
    const [copied, setCopied] = useState(false);
    const [exportCode, setExportCode] = useState('');
    const [codeFormat, setCodeFormat] = useState('curl'); // 'curl' | 'powershell'

    // Import State
    const [importInput, setImportInput] = useState('');
    const [importError, setImportError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen && requestConfig) {
            if (codeFormat === 'curl') {
                setExportCode(generateCurlFromConfig(requestConfig, getEnvVariable));
            } else {
                setExportCode(generatePowerShellFromConfig(requestConfig, getEnvVariable));
            }
            setImportInput('');
            setImportError('');
            setIsSuccess(false);
            setActiveTab('export');
        }
    }, [isOpen, requestConfig, codeFormat]);

    if (!isOpen || !mounted) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(exportCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleApplyImport = () => {
        setImportError('');

        if (!importInput.trim().toLowerCase().startsWith('curl')) {
            setImportError("Invalid format. Command must start with 'curl'");
            return;
        }

        try {
            const parsedConfig = parseCurlToConfig(importInput);

            Object.entries(parsedConfig).forEach(([key, value]) => {
                updateActiveRequest(key, value);
            });

            setIsSuccess(true);

            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setImportError('Failed to parse cURL command.');
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-bg-panel border border-border-strong rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* Header & Tabs */}
                <div className="px-6 pt-6 pb-4 border-b border-border-subtle bg-bg-base/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <TerminalSquare size={18} className="text-emerald-500" />
                            cURL Manager
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-bg-input transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex gap-4 text-sm font-medium">
                        <button
                            onClick={() => setActiveTab('export')}
                            className={`pb-2 border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'export'
                                ? 'border-brand-orange text-text-primary'
                                : 'border-transparent text-text-muted hover:text-text-secondary'
                                }`}
                        >
                            <ArrowUpFromLine size={14} /> Export (HTTP → cURL)
                        </button>
                        <button
                            onClick={() => setActiveTab('import')}
                            className={`pb-2 border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'import'
                                ? 'border-brand-orange text-text-primary'
                                : 'border-transparent text-text-muted hover:text-text-secondary'
                                }`}
                        >
                            <ArrowDownToLine size={14} /> Import (cURL → HTTP)
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* --- EXPORT TAB --- */}
                    {activeTab === 'export' && (
                        <div className="animate-in fade-in">
                            <div className="flex items-center justify-between mb-3">
                                <select
                                    value={codeFormat}
                                    onChange={(e) => setCodeFormat(e.target.value)}
                                    className="bg-bg-input text-text-primary text-xs border border-border-subtle rounded px-2 py-1 mb-2"
                                >
                                    <option value="curl">Bash cURL</option>
                                    <option value="powershell">PowerShell (Invoke-RestMethod)</option>
                                </select>
                                <span className="text-sm font-semibold text-text-secondary">
                                    Generated {codeFormat === 'curl' ? 'Bash' : 'PowerShell'} Command
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-input hover:bg-white/10 rounded border border-border-subtle text-xs font-medium text-text-primary transition-colors"
                                >
                                    {copied ? (
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                    ) : (
                                        <Copy size={14} />
                                    )}
                                    {copied ? 'Copied!' : 'Copy Code'}
                                </button>
                            </div>
                            <pre className="w-full max-h-80 bg-[#0d0d0d] border border-border-subtle rounded-lg p-4 text-xs font-mono text-emerald-400 overflow-auto custom-scrollbar whitespace-pre-wrap break-words">
                                {exportCode}
                            </pre>
                        </div>
                    )}

                    {/* --- IMPORT TAB --- */}
                    {activeTab === 'import' && (
                        <div className="animate-in fade-in">
                            <p className="text-sm text-text-secondary mb-4">
                                Paste a cURL command below. This will{' '}
                                <strong className="text-red-400">overwrite</strong> the current
                                HTTP request configuration.
                            </p>

                            {importError && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-md">
                                    {importError}
                                </div>
                            )}

                            {isSuccess && (
                                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs rounded-md flex items-center gap-2">
                                    <CheckCircle2 size={16} />
                                    Request overwritten successfully!
                                </div>
                            )}

                            <textarea
                                value={importInput}
                                onChange={(e) => setImportInput(e.target.value)}
                                placeholder={`curl -X POST https://api.example.com
  -H 'Content-Type: application/json'
  -d '{"key": "value"}'`}
                                className="w-full h-64 bg-[#0d0d0d] border border-border-subtle rounded-lg p-4 text-xs font-mono text-blue-400 focus:outline-none focus:border-brand-blue custom-scrollbar resize-none mb-4"
                                autoFocus
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleApplyImport}
                                    disabled={!importInput.trim() || isSuccess}
                                    className="px-6 py-2 text-sm font-bold bg-brand-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg flex items-center gap-2"
                                >
                                    <ArrowDownToLine size={16} /> Apply to Request
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}