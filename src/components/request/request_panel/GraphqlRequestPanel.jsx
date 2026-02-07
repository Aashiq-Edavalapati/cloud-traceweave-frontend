'use client';
import { useState, useEffect } from 'react';
import { Save, Loader2, Play } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { UrlBar } from '@/components/request/UrlBar';
import { Tabs } from '@/components/ui/Tabs';
import ResponsePane from '@/components/request/ResponsePane';
import SaveRequestModal from '@/components/request/SaveRequestModal';
import AuthEditor from '@/components/request/AuthEditor';

export default function GraphqlRequestPanel({ activeId }) {
  const store = useAppStore();
  const activeReqState = store.requestStates[activeId] || { url: '', method: 'POST' };

  // Local State
  const [configTab, setConfigTab] = useState('Query');
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  // Resizing Logic (Standardized)
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ y: 0, h: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      if (!isResizing) return;
      e.preventDefault();
      const delta = dragStart.y - e.clientY;
      store.setResponsePaneHeight(Math.max(100, Math.min(window.innerHeight - 150, dragStart.h + delta)));
    };
    const handleUp = () => { setIsResizing(false); document.body.style.cursor = 'default'; };
    if (isResizing) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      document.body.style.cursor = 'row-resize';
    }
    return () => { document.removeEventListener('mousemove', handleMove); document.removeEventListener('mouseup', handleUp); };
  }, [isResizing, dragStart, store]);

  // Derived
  const isDirty = store.unsavedRequests.has(activeId);
  const activeItemName = activeReqState.name || 'Untitled GraphQL';
  let collectionName = activeReqState.collectionId 
    ? store.collections.find(c => c.id === activeReqState.collectionId)?.name || 'Unknown' 
    : 'Scratchpad';

  // Handlers
  const handleSave = () => !activeReqState.collectionId ? setIsSaveModalOpen(true) : store.saveRequest(activeId);
  const handleRename = () => { store.renameItem(activeId, tempName); setIsRenaming(false); };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle shrink-0">
        <div className="flex items-center justify-between mb-3 h-6">
          <div className="flex items-center gap-2 text-xs text-text-secondary w-full">
            <span className={!activeReqState.collectionId ? 'italic opacity-70' : ''}>{collectionName}</span> /
            {isRenaming ? (
              <input autoFocus type="text" value={tempName} onChange={e => setTempName(e.target.value)} onBlur={handleRename} onKeyDown={e => e.key === 'Enter' && handleRename()} className="bg-bg-input text-text-primary border border-brand-orange px-1 py-0.5 rounded focus:outline-none" />
            ) : (
              <span className="text-text-primary font-medium cursor-text hover:border-b" onDoubleClick={() => { setTempName(activeItemName); setIsRenaming(true); }}>{activeItemName}</span>
            )}
            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-pink-900/30 text-pink-400 border border-pink-800 rounded">GQL</span>
          </div>
          <button onClick={handleSave} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border transition ${isDirty ? 'bg-bg-input border-brand-orange text-text-primary' : 'bg-bg-input border-border-subtle text-text-secondary'}`}>
            <Save size={14} /> {isDirty ? 'Save*' : 'Saved'}
          </button>
        </div>

        {/* URL Bar */}
        <div className="flex h-10 mb-4 rounded border border-border-subtle bg-bg-input z-10 relative">
           {/* Static POST for GQL usually */}
          <div className="flex items-center px-3 border-r border-border-subtle font-bold text-xs text-brand-orange">POST</div>
          <UrlBar value={activeReqState.url} onChange={(val) => store.updateActiveRequest('url', val)} />
          <button onClick={store.executeRequest} disabled={store.isLoading} className="bg-brand-blue hover:bg-blue-600 text-white font-medium px-4 flex items-center gap-2 rounded-r w-[90px] justify-center">
            {store.isLoading ? <Loader2 className="animate-spin" size={16} /> : <><Play size={14} fill="currentColor" /> Query</>}
          </button>
        </div>

        <Tabs tabs={['Query', 'Variables', 'Headers', 'Authorization', 'Docs']} activeTab={configTab} onTabClick={setConfigTab} />
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto flex flex-col relative bg-bg-base">
        {configTab === 'Query' && (
          <textarea 
            className="flex-1 w-full h-full bg-transparent p-4 text-xs font-mono text-text-primary resize-none focus:outline-none"
            placeholder="query { user { id name } }"
            defaultValue={activeReqState.body?.raw || ''}
            onChange={(e) => store.updateActiveRequestDeep(['body', 'raw'], e.target.value)}
          />
        )}
        {configTab === 'Variables' && <div className="p-4 text-xs text-text-secondary">JSON Variables Editor</div>}
        {configTab === 'Headers' && <div className="p-4 text-xs text-text-secondary">Headers Editor</div>}
        {configTab === 'Authorization' && <AuthEditor />}
      </div>

      {/* Response Pane */}
      <div onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); setDragStart({y: e.clientY, h: store.responsePaneHeight}); }} className="h-1 bg-border-subtle hover:bg-brand-orange cursor-row-resize shrink-0" />
      <div style={{ height: store.responsePaneHeight }} className="shrink-0 overflow-hidden border-t border-border-subtle">
        <ResponsePane height={store.responsePaneHeight} />
      </div>

      <SaveRequestModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} requestId={activeId} />
    </div>
  );
}