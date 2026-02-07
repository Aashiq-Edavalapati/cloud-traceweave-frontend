'use client';
import { useAppStore } from '@/store/useAppStore';
import { ChevronDown, FileCode, UploadCloud } from 'lucide-react';
import Editor from '@monaco-editor/react';
import KeyValueTable from './KeyValueTable';

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
    const bodyState = request?.body || { type: 'none', language: 'json', formdata: [] };

    const updateBody = (field, value) => {
        store.updateActiveRequestDeep(['body', field], value);
    };

    return (
        <div className="flex flex-col h-full bg-bg-base">
            {/* Type Selector (Radio-like) */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle text-xs bg-bg-base shrink-0">
                <div className="flex items-center gap-4">
                    {BODY_TYPES.map(type => (
                        <label key={type.id} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="bodyType"
                                checked={bodyState.type === type.id}
                                onChange={() => updateBody('type', type.id)}
                                className="accent-brand-orange cursor-pointer"
                            />
                            <span className={bodyState.type === type.id ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}>
                                {type.label}
                            </span>
                        </label>
                    ))}
                </div>

                {/* JSON Dropdown for Raw */}
                {bodyState.type === 'raw' && (
                    <div className="relative group">
                        <button className="flex items-center gap-1 text-brand-orange font-bold hover:text-orange-400">
                            {RAW_LANGUAGES.find(l => l.id === bodyState.language)?.label || 'Text'}
                            <ChevronDown size={10} />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-24 bg-bg-panel border border-border-subtle rounded shadow-xl py-1 z-50 hidden group-hover:block">
                            {RAW_LANGUAGES.map(lang => (
                                <div
                                    key={lang.id}
                                    onClick={() => updateBody('language', lang.id)}
                                    className={`px-3 py-1.5 hover:bg-brand-blue hover:text-white cursor-pointer ${bodyState.language === lang.id ? 'text-brand-orange font-bold' : 'text-text-secondary'}`}
                                >
                                    {lang.label}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Editor Content */}
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
                        options={{
                            minimap: { enabled: false },
                            fontSize: 12,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            fontFamily: 'monospace',
                            padding: { top: 10 }
                        }}
                    />
                )}

                {(bodyState.type === 'formdata' || bodyState.type === 'urlencoded') && (
                    <div className="p-4 h-full overflow-y-auto custom-scrollbar">
                        <KeyValueTable listKey="body.formdata" data={bodyState.formdata || []} />
                    </div>
                )}

                {bodyState.type === 'binary' && (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                        <div className="border border-dashed border-border-strong rounded-lg p-8 flex flex-col items-center gap-4 bg-bg-input/20">
                            <UploadCloud size={32} className="text-brand-orange" />
                            <span className="text-xs">Select a file to upload</span>
                            <input
                                type="file"
                                className="text-xs text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-orange file:text-white hover:file:bg-orange-600"
                                onChange={(e) => updateBody('binaryPath', e.target.value)} // Mock path
                            />
                            {bodyState.binaryPath && <span className="text-[10px] font-mono text-text-muted">{bodyState.binaryPath}</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}