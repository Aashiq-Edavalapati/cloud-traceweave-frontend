'use client';
import { Loader2, Box, Download, BookOpen } from 'lucide-react';

export default function SchemaViewer({ schema, isLoading, onFetch }) {
    if (isLoading) {
        return (
            <div className="p-8 flex justify-center text-brand-primary">
                <Loader2 className="animate-spin" />
            </div>
        );
    }
    
    if (!schema) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-text-secondary gap-4 p-8 text-center">
                <Box size={48} className="opacity-20 text-pink-500" />
                <div className="text-sm">No Schema Available</div>
                <div className="text-xs text-text-muted max-w-sm">
                    Fetch the schema to enable documentation and autocomplete for your queries.
                </div>
                <button 
                    onClick={onFetch} 
                    className="mt-2 bg-bg-input border border-border-strong hover:bg-bg-panel text-text-primary px-4 py-2 rounded text-xs flex items-center gap-2"
                >
                    <Download size={14} /> Fetch Introspection Schema
                </button>
            </div>
        );
    }

    const types = schema.__schema?.types?.filter(t => !t.name.startsWith('__')) || [];

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-4 bg-bg-base relative">
            <button 
                onClick={onFetch} 
                className="absolute top-4 right-4 bg-bg-input border border-border-strong hover:bg-bg-panel text-text-primary px-3 py-1.5 rounded text-xs flex items-center gap-2"
            >
                <Download size={12} /> Refetch
            </button>
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                <Box size={16} className="text-pink-500"/> Schema Explorer
            </h3>
            <div className="space-y-4">
                {types.map(type => (
                    <div key={type.name} className="bg-bg-panel border border-border-subtle rounded p-3">
                        <div className="text-xs font-bold text-brand-blue mb-1">
                            {type.name} <span className="text-text-muted text-[10px] font-normal font-mono px-2">{type.kind}</span>
                        </div>
                        {type.description && <div className="text-xs text-text-secondary mb-2 italic">{type.description}</div>}
                        {type.fields && (
                            <div className="pl-4 border-l border-border-subtle mt-2 space-y-1">
                                {type.fields.map(f => (
                                    <div key={f.name} className="text-xs font-mono text-text-primary">
                                        {f.name}: <span className="text-emerald-500">{f.type?.name || f.type?.ofType?.name || 'Type'}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
