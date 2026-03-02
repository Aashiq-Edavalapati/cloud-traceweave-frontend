'use client';
import { useAppStore } from '@/store/useAppStore';
import { ChevronDown, UploadCloud, File, X } from 'lucide-react';
import Editor from '@monaco-editor/react';
import KeyValueTable from '@/components/request/KeyValueTable';

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
    const activeId = store.activeTabId;
    const request = store.requestStates[activeId];
    const bodyState = request?.config?.body || { type: 'none', language: 'json' };

    const updateBody = (field, value) => {
        store.updateActiveRequestDeep(['config', 'body', field], value);
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
                        <div className="border border-dashed border-border-strong rounded-lg p-8 flex flex-col items-center gap-4 bg-bg-input/20 relative">
                            {/* If a file is selected, show it. Otherwise, show upload prompt */}
                            {bodyState.binaryFile instanceof File ? (
                                <>
                                    <File size={32} className="text-emerald-500" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-text-primary">{bodyState.binaryFile.name}</span>
                                        <button onClick={() => updateBody('binaryFile', null)} className="text-text-secondary hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <span className="text-xs text-text-muted">{(bodyState.binaryFile.size / 1024).toFixed(2)} KB</span>
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
                                    <span className="bg-brand-primary text-white px-4 py-2 rounded-full text-xs font-bold pointer-events-none">Choose File</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
