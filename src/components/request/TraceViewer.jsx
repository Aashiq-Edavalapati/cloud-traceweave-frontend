'use client';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MessageSquare } from 'lucide-react';

export default function TraceViewer({ traceData }) {
    const { spanNotes, addSpanNote } = useAppStore();
    const [activeSpanId, setActiveSpanId] = useState(null);
    const [noteInput, setNoteInput] = useState('');

    const handleSpanClick = (span) => {
        setActiveSpanId(span.id);
        setNoteInput(spanNotes[span.id] || '');
    };

    const handleSaveNote = () => {
        addSpanNote(activeSpanId, noteInput);
        setActiveSpanId(null);
    };

    return (
        <div className="flex h-full">
            {/* Trace Waterfall */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-xs font-bold text-text-secondary uppercase mb-4 pl-2">Distributed Trace</h3>

                <div className="space-y-1">
                    {traceData.map((span) => {
                        const hasNote = !!spanNotes[span.id];
                        // Color logic based on status
                        const barColor = span.status >= 500 ? 'bg-red-500' : 'bg-brand-blue';

                        return (
                            <div
                                key={span.id}
                                onClick={() => handleSpanClick(span)}
                                className={`
                   group relative flex items-center h-8 rounded hover:bg-bg-input cursor-pointer transition-colors
                   ${activeSpanId === span.id ? 'bg-bg-input ring-1 ring-brand-primary' : ''}
                `}
                            >
                                {/* Visual Waterfall Bar */}
                                <div
                                    style={{ marginLeft: `${span.offset}px`, width: `${Math.max(4, span.duration)}px` }}
                                    className={`h-2 rounded-full opacity-80 group-hover:opacity-100 ${barColor}`}
                                />

                                {/* Label */}
                                <span className="ml-3 text-xs font-mono text-text-primary flex items-center gap-2">
                                    <span className="font-bold text-brand-primary">{span.service}</span>
                                    <span className="text-text-secondary">/</span>
                                    {span.name}
                                    <span className="text-text-muted text-[10px]">({span.duration}ms)</span>
                                </span>

                                {/* Annotation Indicator */}
                                {hasNote && <MessageSquare size={10} className="ml-auto mr-4 text-brand-primary fill-brand-primary" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Annotation Sidebar (Appears when span clicked) */}
            {activeSpanId && (
                <div className="w-64 border-l border-border-subtle bg-bg-panel p-4 flex flex-col shrink-0">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-text-primary">Span Annotation</span>
                        <button onClick={() => setActiveSpanId(null)} className="text-text-secondary hover:text-text-primary">✕</button>
                    </div>
                    <div className="text-[10px] text-text-secondary mb-2 font-mono">
                        ID: {activeSpanId}
                    </div>
                    <textarea
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        className="flex-1 bg-bg-input border border-border-subtle rounded p-2 text-xs text-text-primary focus:border-brand-primary outline-none resize-none mb-2"
                        placeholder="Add an observation or error note..."
                    />
                    <button
                        onClick={handleSaveNote}
                        className="bg-brand-primary text-white text-xs font-bold py-1.5 rounded hover:bg-brand-glow transition"
                    >
                        Pin Note
                    </button>
                </div>
            )}
        </div>
    );
}
