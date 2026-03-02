import { useState } from 'react';
import { Save, Loader2, CookieIcon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { UrlBar } from '@/components/request/UrlBar';
import { Tabs } from '@/components/ui/Tabs';
import HttpMethodDropdown from './HttpMethodDropdown';
import ProtocolSwitcher from '@/components/request/ProtocolSwitcher';

export default function HttpHeader({ activeId, configTab, setConfigTab, onOpenSaveModal, onOpenCookieModal }) {
  const store = useAppStore();
  const activeReqState = store.requestStates[activeId] || { config: { url: '', method: 'GET' } };

  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');

  const isDirty = store.unsavedRequests.has(activeId);
  const activeItemName = activeReqState.name || 'Untitled Request';
  const isNew = !activeReqState.collectionId || activeReqState.isDetached;

  let collectionName = 'Scratchpad';
  if (activeReqState.collectionId) {
    const parentCol = store.collections.find(c => c.id === activeReqState.collectionId);
    if (parentCol) collectionName = parentCol.name;
  }

  const handleRenameStart = () => { setTempName(activeItemName); setIsRenaming(true); };
  const handleRenameSave = () => { store.renameItem(activeId, tempName); setIsRenaming(false); };
  const handleSaveClick = () => {
    if (isNew) onOpenSaveModal();
    else store.saveRequest(activeId);
  };

  return (
    <div className="p-4 border-b border-border-subtle shrink-0">
      <div className="flex items-center justify-between mb-3 h-6">
        <div className="flex items-center gap-2 text-xs text-text-secondary select-none w-full">
          <span className={isNew ? 'italic opacity-70' : ''}>{collectionName}</span>
          <span>/</span>

          {isRenaming ? (
            <input
              autoFocus
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleRenameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSave()}
              className="bg-bg-input text-text-primary border border-brand-primary px-1 py-0.5 rounded focus:outline-none"
            />
          ) : (
            <span
              className="text-text-primary font-medium cursor-text hover:border-b hover:border-text-secondary"
              onDoubleClick={handleRenameStart}
            >
              {activeItemName}
            </span>
          )}

          <ProtocolSwitcher
            currentProtocol={activeReqState.protocol || 'http'}
            onChange={(id) => store.updateActiveRequest('protocol', id)}
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={onOpenCookieModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-border-subtle text-text-secondary hover:bg-bg-input hover:text-text-primary transition"
            title="View Persistent Cookies (Jar)"
          >
            <CookieIcon size={14} /> Cookies
          </button>
          <button
            onClick={handleSaveClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border transition ${isDirty ? 'bg-bg-input border-brand-primary text-text-primary' : 'bg-bg-input border-border-subtle text-text-secondary'}`}
          >
            <Save size={14} /> {isDirty ? 'Save*' : 'Saved'}
          </button>
        </div>
      </div>

      <div className="flex h-10 mb-4 rounded border border-border-subtle bg-bg-input focus-within:border-border-strong transition-colors z-50 relative">
        <HttpMethodDropdown activeId={activeId} />
        <UrlBar value={activeReqState.config?.url || ''} onChange={(val) => store.updateActiveRequest('url', val)} />
        <button
          onClick={store.executeRequest}
          disabled={store.isLoading}
          className="bg-brand-primary hover:bg-brand-glow text-brand-surface font-black px-4 flex items-center gap-2 transition rounded-r disabled:opacity-70 disabled:cursor-not-allowed w-[90px] justify-center shadow-glow-sm"
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
  );
}
