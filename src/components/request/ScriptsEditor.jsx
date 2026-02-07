'use client';
import { useAppStore } from '@/store/useAppStore';
import Editor from '@monaco-editor/react';

export default function ScriptsEditor() {
    const store = useAppStore();
    const activeId = store.activeTabId;
    const scriptsState = store.requestStates[activeId]?.scripts || { pre: '', post: '' };

    const updateScript = (type, value) => {
        store.updateActiveRequestDeep(['scripts', type], value);
    };

    const editorOptions = {
        minimap: { enabled: false },
        fontSize: 12,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        fontFamily: 'monospace',
        padding: { top: 10 }
    };

    return (
        <div className="flex h-full bg-bg-base">
            {/* Pre-request */}
            <div className="flex-1 flex flex-col border-r border-border-subtle min-w-0">
                <div className="px-4 py-2 border-b border-border-subtle text-xs font-bold text-text-secondary uppercase tracking-wide bg-bg-input/20">
                    Pre-request Script
                </div>
                <div className="flex-1 overflow-hidden">
                    <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        theme="vs-dark"
                        value={scriptsState.pre || ''}
                        onChange={(val) => updateScript('pre', val)}
                        options={editorOptions}
                    />
                </div>
            </div>

            {/* Post-response */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="px-4 py-2 border-b border-border-subtle text-xs font-bold text-text-secondary uppercase tracking-wide bg-bg-input/20">
                    Post-response (Tests)
                </div>
                <div className="flex-1 overflow-hidden">
                    <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        theme="vs-dark"
                        value={scriptsState.post || ''}
                        onChange={(val) => updateScript('post', val)}
                        options={editorOptions}
                    />
                </div>
            </div>
        </div>
    );
}