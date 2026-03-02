'use client';
import { useState } from 'react';
import { Plus, Trash2, Globe, Save } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function EnvironmentTab({ envId }) {
    const store = useAppStore();
    const environment = store.getEnvironmentById(envId);
    const isDirty = store.unsavedRequests.has(envId);

    // Local state for new row
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');

    if (!environment) return <div className="p-4 text-text-secondary">Environment not found</div>;

    const handleAdd = () => {
        if (!newKey) return;
        store.addEnvironmentVariable(environment.id, { key: newKey, value: newValue, enabled: true });
        setNewKey('');
        setNewValue('');
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-base overflow-hidden">
            {/* Header / Meta */}
            <div className="p-6 border-b border-border-subtle shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-brand-primary/10 rounded-md">
                            <Globe size={20} className="text-brand-primary" />
                        </div>
                        <div className="flex-1">
                            <input
                                className="bg-transparent text-xl font-bold text-text-primary outline-none placeholder:text-text-muted w-full"
                                value={environment.name}
                                onChange={(e) => store.renameItem(environment.id, e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => store.saveEnvironment(environment.id)}
                        disabled={!isDirty}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${isDirty
                            ? 'bg-brand-primary text-brand-surface font-black hover:bg-brand-glow shadow-glow-sm'
                            : 'bg-bg-input text-text-secondary cursor-default opacity-70'
                            }`}
                    >
                        <Save size={14} />
                        {isDirty ? 'Save Environment' : 'Saved'}
                    </button>
                </div>
                <p className="text-xs text-text-secondary ml-11">
                    Variables in this environment are shared with team members in <span className="text-text-primary font-medium">My Workspace</span>.
                </p>
            </div>

            {/* Table Area */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
                <div className="flex-1 border border-border-subtle rounded-md overflow-hidden bg-bg-input/20 flex flex-col shadow-sm">
                    {/* Table Header */}
                    <div className="grid grid-cols-[40px_1fr_1fr_1fr_40px] bg-bg-input border-b border-border-subtle text-xs font-bold text-text-secondary py-2 uppercase tracking-wider">
                        <div className="text-center"></div>
                        <div className="px-3 border-l border-border-subtle">Variable</div>
                        <div className="px-3 border-l border-border-subtle">Initial Value</div>
                        <div className="px-3 border-l border-border-subtle">Current Value</div>
                        <div></div>
                    </div>

                    {/* Table Body */}
                    <div className="overflow-y-auto custom-scrollbar flex-1 bg-bg-base">
                        {(environment.variables || []).map((variable, idx) => (
                            <div key={idx} className="grid grid-cols-[40px_1fr_1fr_1fr_40px] border-b border-border-subtle items-center text-xs group hover:bg-bg-input/30 transition-colors">
                                <div className="flex justify-center">
                                    <input
                                        type="checkbox"
                                        checked={variable.enabled ?? true}
                                        onChange={(e) => store.updateEnvironmentVariable(environment.id, idx, 'enabled', e.target.checked)}
                                        className="accent-brand-primary cursor-pointer"
                                    />
                                </div>
                                <input
                                    className="bg-transparent p-3 text-text-primary focus:outline-none font-mono font-medium border-l border-border-subtle"
                                    value={variable.key}
                                    onChange={(e) => store.updateEnvironmentVariable(environment.id, idx, 'key', e.target.value)}
                                />
                                <input
                                    className="bg-transparent p-3 text-text-secondary focus:outline-none font-mono border-l border-border-subtle"
                                    value={variable.value}
                                    onChange={(e) => store.updateEnvironmentVariable(environment.id, idx, 'value', e.target.value)}
                                />
                                <input
                                    className="bg-transparent p-3 text-brand-primary focus:outline-none font-mono border-l border-border-subtle"
                                    value={variable.value}
                                    onChange={(e) => store.updateEnvironmentVariable(environment.id, idx, 'value', e.target.value)}
                                />
                                <div className="flex justify-center text-text-secondary hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => store.removeEnvironmentVariable(environment.id, idx)}>
                                    <Trash2 size={14} />
                                </div>
                            </div>
                        ))}

                        {/* Add New Row */}
                        <div className="grid grid-cols-[40px_1fr_1fr_1fr_40px] bg-bg-input/10 items-center text-xs p-0 border-b border-border-subtle/50">
                            <div></div>
                            <input
                                className="bg-transparent p-3 text-text-primary focus:outline-none font-mono border-l border-border-subtle placeholder:text-text-tertiary"
                                placeholder="Add new variable"
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                            <input
                                className="bg-transparent p-3 text-text-primary focus:outline-none font-mono border-l border-border-subtle placeholder:text-text-tertiary"
                                placeholder="Value"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                            <div className="p-3 text-text-tertiary italic border-l border-border-subtle"></div>
                            <button className="flex justify-center text-text-secondary hover:text-brand-primary transition" onClick={handleAdd}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
