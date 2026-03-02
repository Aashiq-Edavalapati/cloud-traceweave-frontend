'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Edit2, Check, X, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

const FloatingTooltip = ({ data, onSave, onManage, onMouseEnter, onMouseLeave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(data?.resolvedValue || '');

    if (!data) return null;

    const { rect, name, resolvedValue, selectedEnvName, isSystemNoEnv } = data;

    const style = {
        top: `${rect.bottom + 5}px`,
        left: `${rect.left}px`,
    };

    const handleSaveClick = () => {
        onSave(data.varName, editValue);
        setIsEditing(false);
    };

    return createPortal(
        <div
            className="fixed z-[9998] w-80 bg-bg-panel border border-border-strong rounded-lg shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200"
            style={style}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="text-[10px] uppercase font-bold mb-2 tracking-wider border-b border-border-subtle pb-1 flex justify-between items-center">
                {isSystemNoEnv ? (
                    <span className="text-text-muted flex items-center gap-1">
                        <AlertCircle size={10} /> No Environment Selected
                    </span>
                ) : (
                    <span>Resolved in: <span className="text-brand-primary">{selectedEnvName}</span></span>
                )}
            </div>

            <div className="text-xs mb-1 text-text-secondary">Current Value:</div>

            {isSystemNoEnv ? (
                <div className="text-sm text-text-muted italic bg-bg-base/50 p-2 rounded border border-border-subtle mb-3">
                    Select an environment to resolve this variable.
                </div>
            ) : (
                <>
                    {isEditing ? (
                        <div className="flex items-center gap-1 mb-2">
                            <input
                                className="flex-1 bg-bg-input border border-brand-primary/50 rounded px-2 py-1 text-sm text-text-primary focus:outline-none"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                            />
                            <button onClick={handleSaveClick} className="p-1 bg-brand-primary text-brand-surface rounded hover:bg-brand-glow"><Check size={12} /></button>
                            <button onClick={() => setIsEditing(false)} className="p-1 bg-bg-base text-text-secondary rounded hover:text-text-primary"><X size={12} /></button>
                        </div>
                    ) : (
                        <div className="text-sm text-text-primary font-mono bg-bg-input p-2 rounded break-all border border-border-subtle mb-3 flex justify-between items-start group/val">
                            <span>{resolvedValue !== null ? resolvedValue : <span className="text-red-500 italic">Unresolved</span>}</span>
                            <button
                                onClick={(e) => { setIsEditing(true); setEditValue(resolvedValue || ''); }}
                                className="opacity-0 group-hover/val:opacity-100 p-1 hover:bg-bg-base rounded text-text-secondary"
                            >
                                <Edit2 size={10} />
                            </button>
                        </div>
                    )}
                </>
            )}

            <div className="text-[10px] text-text-muted flex justify-between items-center">
                <span>Scope: Environment</span>
                {!isSystemNoEnv && (
                    <span
                        onClick={onManage}
                        className="text-brand-blue cursor-pointer hover:underline"
                    >
                        Manage Variables →
                    </span>
                )}
            </div>
        </div>,
        document.body
    );
};

export const UrlBar = ({ value, onChange }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [tooltipData, setTooltipData] = useState(null);

    // Refs for scrolling synchronization
    const inputRef = useRef(null);
    const overlayRef = useRef(null);
    const hoverTimeoutRef = useRef(null);

    const store = useAppStore();
    const getEnvVariable = store.getEnvVariable;
    const selectedEnvIndex = store.selectedEnvIndex;
    const envs = store.getWorkspaceEnvironments();
    const selectedEnv = envs[selectedEnvIndex];

    const isSystemNoEnv = selectedEnvIndex === -1;
    const selectedEnvName = selectedEnv?.name || 'No Environment';

    // SCROLL SYNC: When input scrolls, scroll overlay matching it
    const handleScroll = () => {
        if (inputRef.current && overlayRef.current) {
            overlayRef.current.scrollLeft = inputRef.current.scrollLeft;
        }
    };

    const handleVarMouseEnter = (e, varNameRaw) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

        const rect = e.target.getBoundingClientRect();
        const varName = varNameRaw.slice(2, -2).trim();
        const resolvedValue = getEnvVariable(varName);

        setTooltipData({
            rect,
            name: varNameRaw,
            varName,
            resolvedValue,
            selectedEnvName,
            isSystemNoEnv
        });
    };

    const handleVarMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setTooltipData(null);
        }, 300);
    };

    const handleUpdateVar = (key, newValue) => {
        if (!selectedEnv) return;
        const idx = selectedEnv.variables.findIndex(v => v.key === key);
        if (idx !== -1) {
            store.updateEnvironmentVariable(selectedEnv.id, idx, 'value', newValue);
        } else {
            store.addEnvironmentVariable(selectedEnv.id, { key, value: newValue, enabled: true });
        }
        setTooltipData(prev => ({ ...prev, resolvedValue: newValue }));
    };

    const handleVarClick = () => {
        inputRef.current?.focus();
    };

    const handleManageClick = () => {
        if (selectedEnv) {
            store.openEnvironmentTab(selectedEnv.id);
            setTooltipData(null);
        }
    };

    const renderRichText = (text) => {
        if (!text) return null;
        const parts = text.split(/(\{\{.*?\}\})/g);
        return parts.map((part, i) => {
            if (part.startsWith('{{') && part.endsWith('}}')) {
                const varName = part.slice(2, -2).trim();
                const isResolved = getEnvVariable(varName) !== null;

                const statusClasses = isResolved
                    ? 'text-emerald-500 border-emerald-500/30'
                    : 'text-red-500 border-red-500/30';

                return (
                    <span
                        key={i}
                        onMouseEnter={(e) => handleVarMouseEnter(e, part)}
                        onMouseLeave={handleVarMouseLeave}
                        onClick={handleVarClick}
                        className={`inline-block cursor-help border-b border-dotted mx-0.5 pointer-events-auto ${statusClasses}`}
                    >
                        {part}
                    </span>
                );
            }
            // Standard text must match input color (white/primary)
            return <span key={i} className="text-text-primary">{part}</span>;
        });
    };

    return (
        <>
            <div className="relative flex-1 h-full font-mono text-sm bg-bg-input">
                {/* OVERLAY (The Colors) 
                    - Always visible (no !isFocused check)
                    - Pointer events none (so clicks go to input)
                    - Hidden overflow (scrolled via JS)
                */}
                <div
                    ref={overlayRef}
                    className="absolute inset-0 flex items-center px-3 whitespace-pre overflow-hidden z-20 pointer-events-none"
                >
                    <div className="min-w-full">
                        {renderRichText(value)}
                    </div>
                </div>

                {/* INPUT (The Typing)
                    - text-transparent (hides raw text)
                    - caret-text-primary (keeps cursor visible)
                    - z-10 (sits on top)
                    - onScroll (syncs background)
                */}
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onScroll={handleScroll}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
                        relative z-10 w-full h-full bg-transparent px-3 
                        focus:outline-none focus:border-border-strong border border-transparent transition-colors
                        text-transparent caret-text-primary 
                        selection:bg-brand-blue/30 selection:text-transparent
                    `}
                    spellCheck="false"
                    placeholder={!value ? "Enter URL or paste request" : ""}
                />
            </div>

            {tooltipData && (
                <FloatingTooltip
                    data={tooltipData}
                    onSave={handleUpdateVar}
                    onManage={handleManageClick}
                    onMouseEnter={() => {
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    }}
                    onMouseLeave={handleVarMouseLeave}
                />
            )}
        </>
    );
};
