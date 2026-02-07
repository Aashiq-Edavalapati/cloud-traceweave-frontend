'use client';
import { useState, useEffect } from 'react';
import { Save, Loader2, Zap, FileJson } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Tabs } from '@/components/ui/Tabs';
import ResponsePane from '@/components/request/ResponsePane';
import SaveRequestModal from '@/components/request/SaveRequestModal';

export default function GrpcRequestPanel({ activeId }) {
  const store = useAppStore();
  const activeReqState = store.requestStates[activeId] || { url: '' };

  // Local State
  const [configTab, setConfigTab] = useState('Message');
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  // Resize Logic
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
  const activeItemName = activeReqState.name || 'Untitled gRPC';
  let collectionName = activeReqState.collectionId ? store.collections.find(c => c.id === activeReqState.collectionId)?.name : 'Scratchpad';

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
            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-blue-900/30 text-blue-400 border border-blue-800 rounded">gRPC</span>
          </div>
          <button onClick={handleSave} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border transition ${isDirty ? 'bg-bg-input border-brand-orange text-text-primary' : 'bg-bg-input border-border-subtle text-text-secondary'}`}>
            <Save size={14} /> {isDirty ? 'Save*' : 'Saved'}
          </button>
        </div>

        {/* gRPC Control Bar */}
        <div className="flex h-10 mb-4 rounded border border-border-subtle bg-bg-input z-10 relative">
          <div className="flex items-center px-3 border-r border-border-subtle text-text-secondary cursor-pointer hover:bg-bg-panel hover:text-text-primary min-w-[120px]">
             <span className="text-xs truncate">Select Service...</span>
          </div>
          <input 
            className="flex-1 bg-transparent px-3 text-xs text-text-primary focus:outline-none placeholder-text-secondary/50"
            placeholder="grpc.server.com:50051"
            value={activeReqState.url}
            onChange={(e) => store.updateActiveRequest('url', e.target.value)}
          />
          <button onClick={store.executeRequest} disabled={store.isLoading} className="bg-brand-blue hover:bg-blue-600 text-white font-medium px-4 flex items-center gap-2 rounded-r w-[90px] justify-center">
             {store.isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Invoke'}
          </button>
        </div>

        <Tabs tabs={['Message', 'Metadata', 'Service Definition']} activeTab={configTab} onTabClick={setConfigTab} />
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto flex flex-col relative bg-bg-base">
        {configTab === 'Message' && (
           <div className="flex-1 flex flex-col p-4">
              <div className="text-[10px] text-text-secondary mb-2 uppercase font-bold tracking-wider">Request Message (JSON)</div>
              <textarea 
                className="flex-1 w-full bg-bg-panel border border-border-subtle rounded p-2 text-xs font-mono text-text-primary resize-none focus:outline-none focus:border-border-strong"
                placeholder="{}"
                defaultValue={activeReqState.body?.raw || ''}
              />
           </div>
        )}
        {configTab === 'Service Definition' && (
            <div className="flex-1 flex flex-col items-center justify-center text-text-secondary gap-2">
                <FileJson size={32} className="opacity-50" />
                <div className="text-sm">No .proto file loaded</div>
                <button className="text-xs text-brand-orange hover:underline">Import Proto File</button>
            </div>
        )}
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