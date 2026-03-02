'use client';
import { useState } from 'react';
import { X, Plus, Trash2, Save, Globe } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useModal } from '@/components/providers/ModalProvider';

export default function EnvironmentManagerPanel({ isOpen, onClose, environment }) {
    const store = useAppStore();
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const { showConfirm } = useModal();

    if (!isOpen || !environment) return null;

    const handleAdd = () => {
        if (!newKey) return;
        // Use addEnvironmentVariable with object structure
        store.addEnvironmentVariable(environment.id, { key: newKey, value: newValue, enabled: true });
        setNewKey('');
        setNewValue('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#181818] border border-border-strong rounded-lg shadow-2xl w-[900px] flex flex-col h-[600px] overflow-hidden">
                {/* Panel Header */}
                <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-bg-panel">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-primary/10 rounded-md">
                            <Globe size={20} className="text-brand-primary" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-text-primary">Manage Environments</h2>
                            <p className="text-xs text-text-secondary">Global and active variables for <span className="text-text-primary font-medium">{environment.name}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-bg-input rounded-full text-text-secondary hover:text-text-primary transition-colors"><X size={20} /></button>
                </div>

                {/* Editor Content */}
                <div className="flex-1 flex flex-col p-6 bg-bg-base">
                    <div className="flex-1 border border-border-subtle rounded-md overflow-hidden bg-bg-input/20 flex flex-col">
                        {/* Table Header */}
                        <div className="grid grid-cols-[1fr_1fr_1fr_40px] bg-bg-input border-b border-border-subtle text-xs font-bold text-text-secondary py-2 px-4 uppercase tracking-wider">
                            <div>Variable</div>
                            <div className="border-l border-border-subtle pl-4">Initial Value</div>
                            <div className="border-l border-border-subtle pl-4">Current Value</div>
                            <div></div>
                        </div>
                        
                        {/* Table Body */}
                        <div className="overflow-y-auto custom-scrollbar flex-1">
                            {(environment.variables || []).map((variable, idx) => (
                                <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_40px] border-b border-border-subtle items-center text-xs group hover:bg-bg-input/30 transition-colors">
                                    <input 
                                        className="bg-transparent p-3 text-text-primary focus:outline-none font-mono font-medium"
                                        value={variable.key}
                                        // Using Index based update
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
                            <div className="grid grid-cols-[1fr_1fr_1fr_40px] bg-brand-primary/5 items-center text-xs p-2 gap-2 border-b border-brand-primary/20">
                                <input 
                                    className="bg-bg-base border border-border-subtle rounded p-2 text-text-primary focus:outline-none font-mono focus:border-brand-primary"
                                    placeholder="Add new variable"
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                />
                                <input 
                                    className="bg-bg-base border border-border-subtle rounded p-2 text-text-primary focus:outline-none font-mono"
                                    placeholder="Value"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                />
                                <div className="text-text-muted italic px-2">Syncs automatically</div>
                                <button className="flex justify-center text-white bg-brand-primary p-1.5 rounded hover:bg-brand-glow transition" onClick={handleAdd}>
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border-subtle bg-bg-panel flex justify-between items-center">
                    <button 
                        className="text-xs text-red-500 hover:text-red-400 font-medium flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 rounded transition"
                        onClick={() => {
                            showConfirm(
                                'Are you sure you want to delete this environment?', 
                                () => {
                                    store.deleteEnvironment(environment.id);
                                    onClose();
                                },
                                'Delete Environment' // Optional title
                            );
                        }}
                    >
                        <Trash2 size={14} /> Delete Environment
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary">Cancel</button>
                        <button onClick={onClose} className="bg-brand-blue text-white px-6 py-2 rounded text-xs font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-900/20 flex items-center gap-2">
                            <Save size={14} /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
