'use client';
import { useState } from 'react';
import { useWsConnection } from '@/hooks/useWsConnection';
import { useResizable } from '@/hooks/useResizable';
import { useUrlParamsSync } from '@/hooks/useUrlParamsSync';

import WsHeader from './websocket/WsHeader';
import WsComposer from './websocket/WsComposer';
import WsLogsPanel from './websocket/WsLogsPanel';
import ParamsEditor from '@/components/request/ParamsEditor';
import HeadersEditor from '@/components/request/HeadersEditor';
import SaveRequestModal from '@/components/request/SaveRequestModal';
import ResizeHandle from './websocket/ResizeHandle';

export default function WebsocketRequestPanel({ activeId }) {
  const [configTab, setConfigTab] = useState('Message');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  const wsState = useWsConnection(activeId);
  const { height: composerH, startDrag, isDragging } = useResizable(220, 120, 520);

  useUrlParamsSync(activeId);

  return (
    <div className="flex flex-col h-full min-h-0 bg-bg-base">
      <WsHeader 
        activeId={activeId}
        configTab={configTab}
        setConfigTab={setConfigTab}
        wsState={wsState}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
      />

      <div className="shrink-0 border-b border-border-subtle flex flex-col overflow-hidden bg-bg-base" style={{ height: composerH }}>
        {configTab === 'Message' && (
          <WsComposer wsState={wsState} />
        )}
        {configTab === 'Params' && <div className="h-full overflow-y-auto"><ParamsEditor activeId={activeId} /></div>}
        {configTab === 'Headers' && <div className="h-full overflow-y-auto"><HeadersEditor activeId={activeId} /></div>}
        {configTab === 'Settings' && (
          <div className="p-6 h-full text-xs text-text-secondary">
             <h3 className="font-semibold text-text-primary mb-4">WebSocket Settings</h3>
             <label className="flex items-center gap-3 select-none">
                 <input type="checkbox" className="accent-brand-primary cursor-pointer" defaultChecked />
                 Follow Redirects during Handshake
             </label>
          </div>
        )}
      </div>

      <ResizeHandle onMouseDown={startDrag} isDragging={isDragging} />

      <WsLogsPanel wsState={wsState} />

      <SaveRequestModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        requestId={activeId}
      />
    </div>
  );
}
