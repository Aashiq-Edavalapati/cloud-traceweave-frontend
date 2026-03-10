'use client';
import { useState } from 'react';
import { Check, Trash2, Plus, FileUp, AlertTriangle, Cloud, Loader2, X, ExternalLink } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/lib/api';

export default function KeyValueTable({ listKey, data, variant = 'standard' }) {
    const store = useAppStore();
    const [uploadingIdx, setUploadingIdx] = useState(null);

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

    const handleCloudUpload = async (file, index) => {
        try {
            setUploadingIdx(index);
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const secureUrl = res.data?.secure_url || res.data?.url || res.data;

            // Save the cloud metadata instead of the raw file
            store.updateRequestListConfig(listKey, index, 'value', {
                isCloud: true,
                url: secureUrl,
                name: file.name,
                type: file.type,
                size: file.size
            });
        } catch (error) {
            console.error("Cloud upload failed", error);
        } finally {
            setUploadingIdx(null);
        }
    };

    return (
        <div className="border border-border-subtle rounded overflow-hidden select-none bg-bg-base">
            <div className="grid grid-cols-[30px_1.5fr_1.5fr_1fr_30px] bg-bg-input border-b border-border-subtle text-xs font-bold text-text-secondary py-1.5 items-center">
                <div className="flex justify-center items-center h-full">
                    <div
                        className={`w-3 h-3 border rounded-sm flex items-center justify-center cursor-pointer transition-colors
                     ${isAllSelected ? 'bg-brand-primary border-brand-primary' : 'border-border-strong hover:border-text-secondary'}
                     ${data.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
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
                    const isLostFile = item.valueType === 'file' && item.value && !(item.value instanceof File) && !item.value.isCloud && typeof item.value === 'object';

                    return (
                        <div key={index} className="grid grid-cols-[30px_1.5fr_1.5fr_1fr_30px] border-b border-border-subtle text-xs text-text-primary group hover:bg-bg-input/30 transition-colors items-center h-[34px]">
                            
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

                            <div className="border-l border-border-subtle h-full flex items-center overflow-hidden px-2">
                                {item.valueType === 'file' ? (
                                    <div className="flex items-center w-full h-full relative">
                                        
                                        {/* Dynamic UI based on File State */}
                                        {isLostFile ? (
                                            <div className="flex items-center gap-1.5 text-red-400 bg-red-400/10 px-2 py-1 rounded text-[10px] border border-red-400/20 w-full truncate relative z-20">
                                                <AlertTriangle size={12} className="shrink-0" />
                                                <span className="truncate">File lost. Re-select.</span>
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => e.target.files[0] && store.attachFileToFormdata(index, e.target.files[0], e.target.files[0].path)} />
                                            </div>
                                        ) : item.value?.isCloud ? (
                                            <div className="flex items-center gap-2 text-blue-400 bg-blue-400/10 px-2.5 py-1.5 rounded text-[11px] border border-blue-400/20 w-full relative z-20 group transition-all hover:bg-blue-400/20">
                                                <Cloud size={14} className="shrink-0" />
                                                
                                                {/* Clickable secure link */}
                                                <a 
                                                    href={item.value.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="truncate font-medium hover:underline flex items-center gap-1.5 flex-1"
                                                    title="View uploaded file in new tab"
                                                >
                                                    {item.value.name}
                                                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                                </a>
                                                
                                                {/* File size indicator */}
                                                <span className="text-[9px] text-blue-400/70 ml-2 bg-blue-400/10 px-1.5 py-0.5 rounded font-mono hidden xl:block shrink-0">
                                                    {(item.value.size / 1024).toFixed(1)} KB
                                                </span>

                                                <button 
                                                    onClick={(e) => { 
                                                        e.preventDefault(); 
                                                        store.updateRequestListConfig(listKey, index, 'value', null); 
                                                    }} 
                                                    className="ml-2 text-blue-400/70 hover:text-red-400 transition-colors z-30 p-0.5 rounded hover:bg-red-400/10 shrink-0"
                                                    title="Remove file"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : item.value instanceof File ? (
                                            <div className="flex items-center gap-2 w-full relative z-20">
                                                <div className="flex items-center gap-1.5 text-text-primary bg-bg-panel px-2 py-1 rounded text-[10px] border border-brand-primary truncate flex-1">
                                                    <FileUp size={12} className="shrink-0 text-brand-primary" />
                                                    <span className="truncate">{item.value.name}</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleCloudUpload(item.value, index)}
                                                    disabled={uploadingIdx === index}
                                                    className="bg-brand-primary text-black px-2 py-1 rounded text-[10px] hover:bg-brand-primary/80 shrink-0 font-bold flex items-center gap-1"
                                                >
                                                    {uploadingIdx === index ? <Loader2 size={10} className="animate-spin" /> : <Cloud size={10} />}
                                                    Upload
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-text-secondary bg-bg-panel px-2 py-1 rounded text-[10px] border border-border-strong w-full truncate relative z-20">
                                                <FileUp size={12} className="shrink-0" />
                                                <span className="truncate">Select File...</span>
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => e.target.files[0] && store.attachFileToFormdata(index, e.target.files[0], e.target.files[0].path)} />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <input type="text" placeholder="Value" value={item.value || ''} onChange={(e) => store.updateRequestListConfig(listKey, index, 'value', e.target.value)} className="bg-transparent px-2 py-1.5 focus:outline-none placeholder:text-text-muted w-full h-full" />
                                )}
                            </div>

                            <input type="text" placeholder="Description" value={item.description || ''} onChange={(e) => store.updateRequestListConfig(listKey, index, 'description', e.target.value)} className="bg-transparent px-2 py-1.5 border-l border-border-subtle focus:outline-none placeholder:text-text-muted h-full" />
                            
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