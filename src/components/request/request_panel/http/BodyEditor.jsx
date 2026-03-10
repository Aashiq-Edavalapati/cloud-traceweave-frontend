'use client';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ChevronDown, UploadCloud, File, X, Cloud, Loader2, ExternalLink } from 'lucide-react';
import Editor from '@monaco-editor/react';
import KeyValueTable from '@/components/request/KeyValueTable';
import { api } from '@/lib/api';

const BODY_TYPES = [
    { id: 'none', label: 'none' },
    { id: 'formdata', label: 'form-data' },
    { id: 'urlencoded', label: 'x-www-form-urlencoded' },
    { id: 'raw', label: 'raw' },
    { id: 'binary', label: 'binary' },
];

const RAW_LANGUAGES = [
    { id: 'json', label: 'JSON' },
    { id: 'text', label: 'Text' },
    { id: 'xml', label: 'XML' },
    { id: 'html', label: 'HTML' },
    { id: 'javascript', label: 'JavaScript' },
];

export default function BodyEditor() {
    const store = useAppStore();
    const [isUploading, setIsUploading] = useState(false);
    
    const activeId = store.activeTabId;
    const request = store.requestStates[activeId];
    const bodyState = request?.config?.body || { type: 'none', language: 'json' };

    const updateBody = (field, value) => {
        store.updateActiveRequestDeep(['config', 'body', field], value);
    };

    const handleBinaryUpload = async (file) => {
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const secureUrl = res.data?.secure_url || res.data?.url || res.data;
            updateBody('binaryFile', {
                isCloud: true,
                url: secureUrl,
                name: file.name,
                type: file.type,
                size: file.size
            });
        } catch (error) {
            console.error("Binary cloud upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-bg-base">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle text-xs bg-bg-base shrink-0">
                <div className="flex items-center gap-4">
                    {BODY_TYPES.map(type => (
                        <label key={type.id} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="bodyType"
                                checked={bodyState.type === type.id}
                                onChange={() => updateBody('type', type.id)}
                                className="accent-brand-primary cursor-pointer"
                            />
                            <span className={bodyState.type === type.id ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}>
                                {type.label}
                            </span>
                        </label>
                    ))}
                </div>

                {bodyState.type === 'raw' && (
                    <div className="relative group">
                        <button className="flex items-center gap-1 text-brand-primary font-bold hover:text-brand-primary">
                            {RAW_LANGUAGES.find(l => l.id === bodyState.language)?.label || 'Text'}
                            <ChevronDown size={10} />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-24 bg-bg-panel border border-border-subtle rounded shadow-xl py-1 z-50 hidden group-hover:block">
                            {RAW_LANGUAGES.map(lang => (
                                <div
                                    key={lang.id}
                                    onClick={() => updateBody('language', lang.id)}
                                    className={`px-3 py-1.5 hover:bg-brand-blue hover:text-white cursor-pointer ${bodyState.language === lang.id ? 'text-brand-primary font-bold' : 'text-text-secondary'}`}
                                >
                                    {lang.label}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-hidden relative">
                {bodyState.type === 'none' && (
                    <div className="flex items-center justify-center h-full text-text-tertiary text-xs select-none">
                        This request does not have a body
                    </div>
                )}

                {bodyState.type === 'raw' && (
                    <Editor
                        height="100%"
                        defaultLanguage={bodyState.language || 'json'}
                        language={bodyState.language || 'json'}
                        value={bodyState.raw || ''}
                        theme="vs-dark"
                        onChange={(val) => updateBody('raw', val)}
                        options={{ minimap: { enabled: false }, fontSize: 12, scrollBeyondLastLine: false, padding: { top: 10 } }}
                    />
                )}

                {bodyState.type === 'formdata' && (
                    <div className="p-4 h-full overflow-y-auto custom-scrollbar">
                        <KeyValueTable listKey={['config', 'body', 'formdata']} data={bodyState.formdata || []} variant="formdata" />
                    </div>
                )}

                {bodyState.type === 'urlencoded' && (
                    <div className="p-4 h-full overflow-y-auto custom-scrollbar">
                        <KeyValueTable listKey={['config', 'body', 'urlencoded']} data={bodyState.urlencoded || []} variant="standard" />
                    </div>
                )}

                {bodyState.type === 'binary' && (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                        <div className="border border-dashed border-border-strong rounded-xl p-10 flex flex-col items-center gap-4 bg-bg-input/10 relative min-w-[300px]">
                            
                            {bodyState.binaryFile?.isCloud ? (
                                <div className="flex flex-col items-center gap-3 w-full">
                                    <div className="relative">
                                        <Cloud size={48} className="text-blue-400" />
                                        <div className="absolute -bottom-1 -right-1 bg-bg-panel rounded-full p-0.5 border border-border-subtle shadow-sm">
                                            <Check size={12} className="text-emerald-500" />
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center text-center w-full px-4">
                                        <a 
                                            href={bodyState.binaryFile.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm font-semibold text-text-primary hover:text-blue-400 transition-colors flex items-center justify-center gap-1.5 group w-full"
                                        >
                                            <span className="truncate max-w-[200px]">{bodyState.binaryFile.name}</span>
                                            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                        </a>
                                        <span className="text-[11px] text-text-muted mt-1.5 font-mono">
                                            {(bodyState.binaryFile.size / 1024).toFixed(2)} KB • {bodyState.binaryFile.type || 'binary'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 mt-5 w-full justify-center border-t border-border-subtle pt-5">
                                        <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-400/10 text-blue-400 border border-blue-400/20 px-2 py-1 rounded">
                                            Cloud Storage Active
                                        </span>
                                        <button 
                                            onClick={() => updateBody('binaryFile', null)} 
                                            className="text-xs text-text-secondary hover:text-red-400 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-red-400/10 transition-colors"
                                        >
                                            <X size={14} /> Remove
                                        </button>
                                    </div>
                                </div>
                            ) : bodyState.binaryFile instanceof File ? (
                                <>
                                    <File size={32} className="text-emerald-500" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-text-primary">{bodyState.binaryFile.name}</span>
                                        <button onClick={() => updateBody('binaryFile', null)} className="text-text-secondary hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <span className="text-xs text-text-muted">{(bodyState.binaryFile.size / 1024).toFixed(2)} KB</span>
                                    
                                    <button 
                                        onClick={() => handleBinaryUpload(bodyState.binaryFile)}
                                        disabled={isUploading}
                                        className="mt-2 bg-brand-primary text-black px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 hover:bg-brand-primary/80 transition-colors"
                                    >
                                        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Cloud size={14} />}
                                        {isUploading ? 'Uploading...' : 'Save to Cloudinary'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={32} className="text-brand-primary" />
                                    <span className="text-xs">Select a file to upload</span>
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) updateBody('binaryFile', file);
                                        }}
                                    />
                                    <span className="bg-brand-primary text-black px-4 py-2 rounded-full text-xs font-bold pointer-events-none">Choose File</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}