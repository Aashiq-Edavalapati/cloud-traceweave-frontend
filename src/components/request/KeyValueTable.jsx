'use client';
import { Check, Trash2, Plus, FileUp, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function KeyValueTable({ listKey, data, variant = 'standard' }) {
    const store = useAppStore();

    const isAllSelected = Array.isArray(data) && data.length > 0 && data.every((item) => item.active);

    const handleAdd = () => {
        const lastIndex = Array.isArray(data) ? data.length : 0;
        store.updateRequestListConfig(listKey, lastIndex, 'key', '');
        store.updateRequestListConfig(listKey, lastIndex, 'valueType', 'text'); 
    };

    const handleToggleAll = () => {
        const newValue = !isAllSelected;
        data.forEach((_, index) => {
            store.updateRequestListConfig(listKey, index, 'active', newValue);
        });
    };

    return (
        <div className="border border-border-subtle rounded overflow-hidden select-none bg-bg-base">
            {/* Header */}
            <div className="grid grid-cols-[30px_1.5fr_1.5fr_1fr_30px] bg-bg-input border-b border-border-subtle text-xs font-bold text-text-secondary py-1.5 items-center">
                <div className="flex justify-center items-center h-full">
                    <div
                        className={`w-3 h-3 border rounded-sm flex items-center justify-center cursor-pointer transition-colors
                     ${isAllSelected ? 'bg-brand-primary border-brand-primary' : 'border-border-strong hover:border-text-secondary'}
                     ${data.length === 0 ? 'opacity-50 pointer-events-none' : ''} 
                    `}
                        onClick={handleToggleAll}
                    >
                        {isAllSelected && <Check size={10} className="text-black" strokeWidth={3} />}
                    </div>
                </div>

                <div className="pl-2 border-l border-border-subtle">KEY</div>
                <div className="pl-2 border-l border-border-subtle">VALUE</div>
                <div className="pl-2 border-l border-border-subtle">DESCRIPTION</div>
                <div></div>
            </div>

            <div className="flex flex-col">
                {(Array.isArray(data) ? data : []).map((item, index) => {
                    // --- DETECT LOST FILE ---
                    const isLostFile = item.valueType === 'file' && item.value && !(item.value instanceof File) && typeof item.value === 'object';

                    return (
                        <div key={index} className="grid grid-cols-[30px_1.5fr_1.5fr_1fr_30px] border-b border-border-subtle text-xs text-text-primary group hover:bg-bg-input/30 transition-colors items-center h-[34px]">
                            {/* Row Active Checkbox */}
                            <div className="flex justify-center items-center h-full">
                                <div className={`w-3 h-3 border rounded-sm flex items-center justify-center cursor-pointer ${item.active ? 'bg-brand-primary border-brand-primary' : 'border-border-strong'}`} onClick={() => store.updateRequestListConfig(listKey, index, 'active', !item.active)}>
                                    {item.active && <Check size={10} className="text-black" strokeWidth={3} />}
                                </div>
                            </div>

                            <div className="flex items-center border-l border-border-subtle h-full bg-transparent">
                                <input type="text" placeholder="Key" value={item.key || ''} onChange={(e) => store.updateRequestListConfig(listKey, index, 'key', e.target.value)} className="bg-transparent px-2 py-1.5 focus:outline-none placeholder:text-text-muted w-full h-full" />
                                {variant === 'formdata' && (
                                    <select value={item.valueType || 'text'} onChange={(e) => { store.updateRequestListConfig(listKey, index, 'valueType', e.target.value); store.updateRequestListConfig(listKey, index, 'value', ''); }} className="bg-bg-panel text-text-secondary text-[10px] outline-none border-l border-border-subtle h-full px-1 cursor-pointer hover:text-text-primary">
                                        <option value="text">Text</option>
                                        <option value="file">File</option>
                                    </select>
                                )}
                            </div>

                            {/* Key Input + From-Data Type Selector */}
                            <div className="border-l border-border-subtle h-full flex items-center overflow-hidden">
                                {item.valueType === 'file' ? (
                                    <div className="flex items-center w-full h-full px-2 relative">
                                        <input
                                            type="file"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    let actualPath = file.path;
                                                    // Use our new secure preload function to get the real path
                                                    if (typeof window !== "undefined" && window.electronAPI?.getFilePath) {
                                                        actualPath = window.electronAPI.getFilePath(file);
                                                    }
                                                    // Use our targeted Zustand action
                                                    store.attachFileToFormdata(index, file, actualPath);
                                                }
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                        />
                                        
                                        {/* Dynamic UI based on File State */}
                                        {isLostFile ? (
                                            <div className="flex items-center gap-1.5 text-red-400 bg-red-400/10 px-2 py-1 rounded text-[10px] border border-red-400/20 w-full truncate">
                                                <AlertTriangle size={12} className="shrink-0" />
                                                <span className="truncate">File lost. Re-select.</span>
                                            </div>
                                        ) : item.value instanceof File ? (
                                            <div className="flex items-center gap-1.5 text-text-primary bg-bg-panel px-2 py-1 rounded text-[10px] border border-brand-primary w-full truncate">
                                                <FileUp size={12} className="shrink-0 text-brand-primary" />
                                                <span className="truncate">{item.value.name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-text-secondary bg-bg-panel px-2 py-1 rounded text-[10px] border border-border-strong w-full truncate">
                                                <FileUp size={12} className="shrink-0" />
                                                <span className="truncate">Select File...</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <input type="text" placeholder="Value" value={item.value || ''} onChange={(e) => store.updateRequestListConfig(listKey, index, 'value', e.target.value)} className="bg-transparent px-2 py-1.5 focus:outline-none placeholder:text-text-muted w-full h-full" />
                                )}
                            </div>

                            {/* Description Input */}
                            <input type="text" placeholder="Description" value={item.description || ''} onChange={(e) => store.updateRequestListConfig(listKey, index, 'description', e.target.value)} className="bg-transparent px-2 py-1.5 border-l border-border-subtle focus:outline-none placeholder:text-text-muted h-full" />
                            
                            {/* Delete Button */}
                            <div className="flex justify-center items-center h-full opacity-0 group-hover:opacity-100 cursor-pointer text-text-secondary hover:text-red-500 transition-opacity" onClick={() => store.removeRequestListItem(listKey, index)}>
                                <Trash2 size={12} />
                            </div>
                        </div>
                    );
                })}

                <div onClick={handleAdd} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-bg-input/50 transition-colors text-text-secondary hover:text-text-primary">
                    <div className="flex justify-center w-[30px]"><Plus size={14} /></div>
                    <span className="text-xs italic text-text-muted">Add new item...</span>
                </div>
            </div>
        </div>
    );
}
