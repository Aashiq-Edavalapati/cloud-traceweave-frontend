import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Tabs } from '@/components/ui/Tabs';
import ProtocolSwitcher from '@/components/request/ProtocolSwitcher';

export default function WsHeader({ activeId, configTab, setConfigTab, wsState, onOpenSaveModal }) {
  const store = useAppStore();
  const activeReqState = store.requestStates[activeId] || { config: { url: '' } };
  
  const parentCollection = store.collections?.find(c => c.id === activeReqState.collectionId);
  const collectionName = parentCollection ? parentCollection.name : 'Unassigned';
  const activeItemName = activeReqState.name || 'New Request';
  
  const isDirty = store.unsavedRequests?.has(activeId) || false;
  const isNew = !activeReqState.collectionId || activeReqState.isDetached;
  const requiresSave = isNew || isDirty;

  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');

  const { isConnected, isConnecting, toggleConnection } = wsState;

  const handleRename = () => {
    setIsRenaming(false);
    if (tempName.trim() && store.updateActiveRequest) {
      store.updateActiveRequest('name', tempName.trim());
    }
  };

  const handleSave = () => {
    if (isNew) onOpenSaveModal();
    else if (store.saveRequest) store.saveRequest(activeId);
  };

  return (
    <div className="px-4 pt-4 pb-0 border-b border-border-subtle shrink-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary min-w-0">
          <span className={`shrink-0 ${isNew ? 'italic opacity-60' : ''}`}>
            {collectionName}
          </span>
          <span className="text-text-muted">/</span>

          {isRenaming ? (
            <input
              autoFocus
              type="text"
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              className="bg-bg-input text-text-primary border border-brand-primary px-1.5 py-0.5 rounded text-xs focus:outline-none"
            />
          ) : (
            <span
              className="text-text-primary font-medium cursor-text truncate"
              onDoubleClick={() => { setTempName(activeItemName); setIsRenaming(true); }}
              title="Double-click to rename"
            >
              {activeItemName}
            </span>
          )}

          <ProtocolSwitcher
            currentProtocol={activeReqState.protocol || 'ws'}
            onChange={id => store.updateActiveRequest('protocol', id)}
          />
        </div>

        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 0.96 }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border transition-colors shrink-0 ${
            requiresSave
              ? 'bg-brand-primary/10 border-brand-primary/50 text-brand-primary'
              : 'bg-bg-input border-border-subtle text-text-secondary hover:text-text-primary'
          }`}
        >
          <Save size={13} />
          {isNew ? 'Save' : (isDirty ? 'Save*' : 'Saved')}
        </motion.button>
      </div>

      <div className="flex h-10 mb-4 rounded-md border border-border-subtle bg-bg-input overflow-hidden focus-within:border-[#333] transition-colors">
        <input
          className="flex-1 bg-transparent px-3 text-xs text-text-primary focus:outline-none placeholder-text-secondary/40 font-mono"
          placeholder="wss://echo.websocket.org"
          value={activeReqState.config?.url || ''}
          onChange={e => store.updateActiveRequest('url', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !isConnected && !isConnecting && toggleConnection()}
        />
        <motion.button
          onClick={toggleConnection}
          whileTap={{ scale: 0.98 }}
          disabled={isConnecting}
          className={`text-white text-xs font-semibold px-5 flex items-center gap-2 min-w-[120px] justify-center transition-colors ${
            isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          } disabled:opacity-60`}
        >
          <AnimatePresence mode="wait">
            {isConnecting ? (
              <motion.span key="loading" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full block" animate={{ rotate: 360 }} transition={{ duration: 0.65, repeat: Infinity, ease: 'linear' }} />
                Connecting
              </motion.span>
            ) : isConnected ? (
              <motion.span key="stop" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <WifiOff size={13} /> Disconnect
              </motion.span>
            ) : (
              <motion.span key="connect" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Wifi size={13} /> Connect
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <Tabs tabs={['Message', 'Params', 'Headers', 'Settings']} activeTab={configTab} onTabClick={setConfigTab} />
    </div>
  );
}
