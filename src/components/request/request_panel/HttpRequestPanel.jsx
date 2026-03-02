'use client';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useResponseResize } from '@/hooks/useResponseResize';
import { useUrlParamsSync } from '@/hooks/useUrlParamsSync';

import HttpHeader from './http/HttpHeader';
import ResponsePane from '@/components/request/ResponsePane';
import ParamsEditor from '@/components/request/ParamsEditor';
import NotesEditor from '@/components/request/NotesEditor';
import CookiesEditor from '@/components/request/CookiesEditor';
import AuthEditor from '../AuthEditor';
import BodyEditor from './http/BodyEditor';
import ScriptsEditor from '@/components/request/ScriptsEditor';
import HeadersEditor from '../HeadersEditor';

import CookieManagerModal from '../CookieManagerModal';
import SaveRequestModal from '@/components/request/SaveRequestModal';

export default function HttpRequestPanel({ activeId }) {
  const store = useAppStore();
  const activeReqState = store.requestStates[activeId] || { config: { url: '' } };

  const [configTab, setConfigTab] = useState('Params');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  
  const { startResize } = useResponseResize();

  useUrlParamsSync(activeId);

  const getDomainFromUrl = (url) => {
    try {
        return new URL(url).hostname;
    } catch {
        return '';
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      
      <HttpHeader 
        activeId={activeId}
        configTab={configTab}
        setConfigTab={setConfigTab}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenCookieModal={() => setIsCookieModalOpen(true)}
      />

      {/* --- CONTENT SWITCHER --- */}
      <div className="flex-1 overflow-auto flex flex-col min-h-0 relative">
        {configTab === 'Params' && <ParamsEditor />}
        {configTab === 'Headers' && <HeadersEditor />}
        {configTab === 'Body' && <BodyEditor />}
        {configTab === 'Cookies' && <CookiesEditor />}
        {configTab === 'Authorization' && <AuthEditor />}
        {configTab === 'Scripts' && <ScriptsEditor />}
        {configTab === 'Notes' && <NotesEditor />}
      </div>

      {/* --- RESIZE HANDLE --- */}
      <div
        onMouseDown={startResize}
        className="h-1 bg-border-subtle hover:bg-brand-primary cursor-row-resize z-20 shrink-0 transition-colors relative"
      >
        <div className="absolute inset-x-0 -top-1 -bottom-1"></div>
      </div>

      {/* --- RESPONSE PANE --- */}
      <div style={{ height: store.responsePaneHeight }} className="shrink-0 border-t border-border-subtle relative z-30">
        <ResponsePane height={store.responsePaneHeight} />
      </div>

      <SaveRequestModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        requestId={activeId}
      />

      <CookieManagerModal 
        isOpen={isCookieModalOpen} 
        onClose={() => setIsCookieModalOpen(false)}
        initialDomain={getDomainFromUrl(activeReqState.config?.url)}
      />
    </div>
  );
}
