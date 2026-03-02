'use client';
import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function EnvironmentEditModal({ isOpen, onClose, environment }) {
    const store = useAppStore();
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');

    if (!isOpen || !environment) return null;

    const handleAdd = () => {
        if (!newKey) return;
        store.updateEnvironmentVariable(environment.id, newKey, newValue, true);
        setNewKey('');
        setNewValue('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-bg-panel border border-border-strong rounded-lg shadow-2xl w-[600px] flex flex-col h-[500px]">
                {/* Header */}
                <div className="px-5 py-4 border-b border-border-subtle flex justify-between items-center bg-bg-base">
                    <div>
                        <h2 className="text-sm font-bold text-text-primary">Manage Environment</h2>
                        <p className="text-xs text-text-secondary">{environment.name}</p>
                    </div>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><X size={18} /></button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    <div className="border border-border-subtle rounded overflow-hidden">
                        <div className="grid grid-cols-[1fr_1fr_40px] bg-bg-input border-b border-border-subtle text-xs font-bold text-text-secondary py-2 px-3">
                            <div>VARIABLE</div>
                            <div>VALUE</div>
                            <div></div>
                        </div>
                        
                        {Object.entries(environment.variables || {}).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-[1fr_1fr_40px] border-b border-border-subtle items-center text-xs group hover:bg-bg-input/20">
                                <input 
                                    className="bg-transparent p-2 text-text-primary focus:outline-none font-mono"
                                    value={key}
                                    onChange={(e) => store.updateEnvironmentVariable(environment.id, e.target.value, value, false, key)}
                                />
                                <input 
                                    className="bg-transparent p-2 text-brand-primary focus:outline-none font-mono border-l border-border-subtle"
                                    value={value}
                                    onChange={(e) => store.updateEnvironmentVariable(environment.id, key, e.target.value, false)}
                                />
                                <div className="flex justify-center text-text-secondary hover:text-red-500 cursor-pointer" onClick={() => store.deleteEnvironmentVariable(environment.id, key)}>
                                    <Trash2 size={14} />
                                </div>
                            </div>
                        ))}

                        {/* Add New Row */}
                        <div className="grid grid-cols-[1fr_1fr_40px] bg-bg-input/10 items-center text-xs p-1">
                             <input 
                                className="bg-bg-base border border-border-subtle rounded p-1.5 text-text-primary focus:outline-none font-mono mx-1"
                                placeholder="New Variable"
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                             />
                             <input 
                                className="bg-bg-base border border-border-subtle rounded p-1.5 text-text-primary focus:outline-none font-mono mx-1"
                                placeholder="Value"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                             />
                             <div className="flex justify-center text-brand-blue cursor-pointer hover:scale-110 transition" onClick={handleAdd}>
                                <Plus size={16} />
                             </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-border-subtle bg-bg-base flex justify-between items-center">
                    <button className="text-xs text-red-500 hover:underline">Delete Environment</button>
                    <button onClick={onClose} className="bg-brand-blue text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-blue-600 transition">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
