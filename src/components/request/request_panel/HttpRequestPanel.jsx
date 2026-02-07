'use client';
import { useState, useEffect } from 'react';
import { ChevronDown, Save, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { UrlBar } from '@/components/request/UrlBar';
import { Tabs } from '@/components/ui/Tabs';
import ResponsePane from '@/components/request/ResponsePane';
import ParamsEditor from '@/components/request/ParamsEditor';
import NotesEditor from '@/components/request/NotesEditor';
import CookiesEditor from '@/components/request/CookiesEditor';
import SaveRequestModal from '@/components/request/SaveRequestModal';
import AuthEditor from '@/components/request/AuthEditor';
import BodyEditor from '@/components/request/BodyEditor';
import ScriptsEditor from '@/components/request/ScriptsEditor';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export default function HttpRequestPanel({ activeId }) {
  const store = useAppStore();
  const activeReqState = store.requestStates[activeId] || { url: '', method: 'GET' };
  
  // Local UI State
  const [configTab, setConfigTab] = useState('Params');
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Response Pane Resizing Logic
  const [isResizingResponse, setIsResizingResponse] = useState(false);
  const [dragStart, setDragStart] = useState({ y: 0, h: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingResponse) return;
      e.preventDefault();
      const delta = dragStart.y - e.clientY;
      const newHeight = Math.max(100, Math.min(window.innerHeight - 150, dragStart.h + delta));
      store.setResponsePaneHeight(newHeight);
    };
    const handleMouseUp = () => {
      setIsResizingResponse(false);
      document.body.style.cursor = 'default';
    };
    if (isResizingResponse) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isResizingResponse, dragStart, store]);

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizingResponse(true);
    setDragStart({ y: e.clientY, h: store.responsePaneHeight });
  };

  // Derived State
  const isDirty = store.unsavedRequests.has(activeId);
  const activeItemName = activeReqState.name || 'Untitled Request';
  
  let collectionName = 'Scratchpad';
  if (activeReqState.collectionId) {
    const parentCol = store.collections.find(c => c.id === activeReqState.collectionId);
    if (parentCol) collectionName = parentCol.name;
  }

  // Handlers
  const handleRenameStart = () => { setTempName(activeItemName); setIsRenaming(true); };
  const handleRenameSave = () => { store.renameItem(activeId, tempName); setIsRenaming(false); };
  const handleSaveClick = () => {
    if (!activeReqState.collectionId) setIsSaveModalOpen(true);
    else store.saveRequest(activeId);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* --- REQUEST CONFIG BAR --- */}
      <div className="p-4 border-b border-border-subtle shrink-0">
        
        {/* Breadcrumbs & Rename */}
        <div className="flex items-center justify-between mb-3 h-6">
          <div className="flex items-center gap-2 text-xs text-text-secondary select-none w-full">
            <span className={!activeReqState.collectionId ? 'italic opacity-70' : ''}>{collectionName}</span> 
            <span>/</span>
            {isRenaming ? (
              <input 
                autoFocus 
                type="text" 
                value={tempName} 
                onChange={(e) => setTempName(e.target.value)} 
                onBlur={handleRenameSave} 
                onKeyDown={(e) => e.key === 'Enter' && handleRenameSave()} 
                className="bg-bg-input text-text-primary border border-brand-orange px-1 py-0.5 rounded focus:outline-none" 
              />
            ) : (
              <span 
                className="text-text-primary font-medium cursor-text hover:border-b hover:border-text-secondary" 
                onDoubleClick={handleRenameStart}
              >
                {activeItemName}
              </span>
            )}
            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-bg-panel border border-border-subtle rounded text-text-secondary">HTTP</span>
          </div>
          <button 
            onClick={handleSaveClick} 
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border transition ${isDirty ? 'bg-bg-input border-brand-orange text-text-primary' : 'bg-bg-input border-border-subtle text-text-secondary'}`}
          >
            <Save size={14} /> {isDirty ? 'Save*' : 'Saved'}
          </button>
        </div>

        {/* URL Bar & SEND BUTTON */}
        <div className="flex h-10 mb-4 rounded border border-border-subtle bg-bg-input focus-within:border-border-strong transition-colors z-10 relative">
          <div className="relative group min-w-[90px] border-r border-border-subtle cursor-pointer hover:bg-bg-panel flex items-center px-3">
            <span className={`text-xs font-bold ${activeReqState.method === 'GET' ? 'text-method-get' : 'text-brand-orange'}`}>
              {activeReqState.method}
            </span>
            <ChevronDown size={12} className="ml-auto text-text-secondary" />
            
            {/* Method Dropdown */}
            <div className="absolute top-full left-0 w-[100px] bg-bg-panel border border-border-subtle rounded shadow-lg hidden group-hover:block z-50">
              {METHODS.map(m => (
                <div 
                  key={m} 
                  onClick={() => store.updateActiveRequest('method', m)} 
                  className="px-3 py-2 text-xs hover:bg-brand-blue hover:text-white"
                >
                  {m}
                </div>
              ))}
            </div>
          </div>

          <UrlBar value={activeReqState.url} onChange={(val) => store.updateActiveRequest('url', val)} />

          <button
            onClick={store.executeRequest}
            disabled={store.isLoading}
            className="bg-brand-blue hover:bg-blue-600 text-white font-medium px-4 flex items-center gap-2 transition rounded-r disabled:opacity-70 disabled:cursor-not-allowed w-[90px] justify-center"
          >
            {store.isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Send'}
          </button>
        </div>

        <Tabs
          tabs={['Params', 'Headers', 'Body', 'Cookies', 'Authorization', 'Scripts', 'Notes']}
          activeTab={configTab}
          onTabClick={setConfigTab}
        />
      </div>

      {/* --- CONTENT SWITCHER --- */}
      <div className="flex-1 overflow-auto flex flex-col min-h-0 relative">
        {configTab === 'Params' && <ParamsEditor />}
        {configTab === 'Headers' && <div className="p-4 text-xs text-text-secondary">Headers Editor (Coming Soon)</div>}
        {configTab === 'Body' && <BodyEditor />}
        {configTab === 'Cookies' && <CookiesEditor />}
        {configTab === 'Authorization' && <AuthEditor />}
        {configTab === 'Scripts' && <ScriptsEditor />}
        {configTab === 'Notes' && <NotesEditor />}
      </div>

      {/* --- RESIZE HANDLE --- */}
      <div
        onMouseDown={handleResizeStart}
        className="h-1 bg-border-subtle hover:bg-brand-orange cursor-row-resize z-20 shrink-0 transition-colors relative"
      >
        <div className="absolute inset-x-0 -top-1 -bottom-1"></div>
      </div>

      {/* --- RESPONSE PANE --- */}
      <div style={{ height: store.responsePaneHeight }} className="shrink-0 overflow-hidden border-t border-border-subtle">
        <ResponsePane height={store.responsePaneHeight} />
      </div>

      <SaveRequestModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        requestId={activeId}
      />
    </div>
  );
}