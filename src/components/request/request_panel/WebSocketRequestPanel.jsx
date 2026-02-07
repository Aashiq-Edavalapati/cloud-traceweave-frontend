'use client';
import { useState, useEffect } from 'react';
import { Save, Loader2, Wifi, WifiOff, Send } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Tabs } from '@/components/ui/Tabs';
import SaveRequestModal from '@/components/request/SaveRequestModal';

export default function WebsocketRequestPanel({ activeId }) {
  const store = useAppStore();
  const activeReqState = store.requestStates[activeId] || { url: '' };

  // Local State
  const [isConnected, setIsConnected] = useState(false);
  const [configTab, setConfigTab] = useState('Message');
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([]);

  // Resize Logic
  const [paneHeight, setPaneHeight] = useState(300); // Local resize for WS split
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMove = (e) => {
       if (!isResizing) return;
       const newH = Math.max(150, Math.min(window.innerHeight - 200, paneHeight + (e.clientY - dragStart)));
       setPaneHeight(newH); // Note: WS usually calculates purely on Flex, but keeping consistent resize UX
    };
    // Simplified local resize logic for brevity in this specific file
  }, [isResizing]);

  // Derived
  const isDirty = store.unsavedRequests.has(activeId);
  const activeItemName = activeReqState.name || 'Untitled WS';
  let collectionName = activeReqState.collectionId ? store.collections.find(c => c.id === activeReqState.collectionId)?.name : 'Scratchpad';

  const handleSave = () => !activeReqState.collectionId ? setIsSaveModalOpen(true) : store.saveRequest(activeId);
  const handleRename = () => { store.renameItem(activeId, tempName); setIsRenaming(false); };
  
  const toggleConnection = () => {
      if (isConnected) {
          setIsConnected(false);
          setLogs(prev => [...prev, { type: 'system', msg: 'Disconnected', time: new Date().toLocaleTimeString() }]);
      } else {
          setIsConnected(true);
          setLogs(prev => [...prev, { type: 'system', msg: `Connected to ${activeReqState.url}`, time: new Date().toLocaleTimeString() }]);
      }
  };

  const sendMessage = () => {
      if(!message) return;
      setLogs(prev => [...prev, { type: 'out', msg: message, time: new Date().toLocaleTimeString() }]);
      // Mock echo response
      setTimeout(() => {
        setLogs(prev => [...prev, { type: 'in', msg: `Echo: ${message}`, time: new Date().toLocaleTimeString() }]);
      }, 300);
      setMessage('');
  };

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
            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-green-900/30 text-green-400 border border-green-800 rounded">WS</span>
          </div>
          <button onClick={handleSave} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border transition ${isDirty ? 'bg-bg-input border-brand-orange text-text-primary' : 'bg-bg-input border-border-subtle text-text-secondary'}`}>
            <Save size={14} /> {isDirty ? 'Save*' : 'Saved'}
          </button>
        </div>

        {/* WS Control Bar */}
        <div className="flex h-10 mb-4 rounded border border-border-subtle bg-bg-input z-10 relative">
          <input 
            className="flex-1 bg-transparent px-3 text-xs text-text-primary focus:outline-none placeholder-text-secondary/50"
            placeholder="wss://echo.websocket.org"
            value={activeReqState.url}
            onChange={(e) => store.updateActiveRequest('url', e.target.value)}
          />
          <button onClick={toggleConnection} className={`text-white font-medium px-4 flex items-center gap-2 rounded-r w-[110px] justify-center transition-colors ${isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
             {isConnected ? <><WifiOff size={14} /> Stop</> : <><Wifi size={14} /> Connect</>}
          </button>
        </div>

        <Tabs tabs={['Message', 'Params', 'Headers', 'Settings']} activeTab={configTab} onTabClick={setConfigTab} />
      </div>

      {/* Main WS Content - Split View */}
      <div className="flex-1 flex flex-col min-h-0">
          
          {/* Top: Message Composer */}
          <div className="h-[150px] shrink-0 border-b border-border-subtle flex flex-col bg-bg-base">
             <div className="flex-1 p-2 relative">
                 <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-full bg-bg-panel border border-border-subtle rounded p-2 text-xs font-mono text-text-primary focus:outline-none resize-none"
                    placeholder="Message to send..."
                 />
                 <button onClick={sendMessage} disabled={!isConnected} className="absolute bottom-4 right-4 bg-brand-blue text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                     <Send size={14} />
                 </button>
             </div>
          </div>

          {/* Bottom: Event Log */}
          <div className="flex-1 overflow-auto bg-bg-base p-4">
              <div className="text-[10px] text-text-secondary mb-2 uppercase font-bold tracking-wider">Event Log</div>
              <div className="flex flex-col gap-1 font-mono text-xs">
                  {logs.length === 0 && <div className="text-text-secondary italic opacity-50">No messages yet...</div>}
                  {logs.map((log, i) => (
                      <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                          <span className="text-text-secondary opacity-50">[{log.time}]</span>
                          {log.type === 'out' && <span className="text-brand-orange">⬆ SENT:</span>}
                          {log.type === 'in' && <span className="text-green-400">⬇ RECV:</span>}
                          {log.type === 'system' && <span className="text-blue-400">ℹ INFO:</span>}
                          <span className="text-text-primary break-all">{log.msg}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      <SaveRequestModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} requestId={activeId} />
    </div>
  );
}