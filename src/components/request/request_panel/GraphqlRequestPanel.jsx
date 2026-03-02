'use client';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useResponseResize } from '@/hooks/useResponseResize';
import { useGraphqlSchema } from '@/hooks/useGraphqlSchema';
import { useUrlParamsSync } from '@/hooks/useUrlParamsSync';

import GraphqlHeader from './graphql/GraphqlHeader';
import ResponsePane from '@/components/request/ResponsePane';
import AuthEditor from '@/components/request/AuthEditor';
import HeadersEditor from '@/components/request/HeadersEditor';
import CookiesEditor from '@/components/request/CookiesEditor';
import CookieManagerModal from '../CookieManagerModal';
import SaveRequestModal from '@/components/request/SaveRequestModal';
import Editor from '@monaco-editor/react';
import SchemaViewer from './graphql/SchemaViewer';
import NotesEditor from '@/components/request/NotesEditor';

export default function GraphqlRequestPanel({ activeId }) {
  const store = useAppStore();
  const activeReqState = store.requestStates[activeId] || { config: { url: '', method: 'POST' } };

  const [configTab, setConfigTab] = useState('Query');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  const { startResize } = useResponseResize();
  const { schema, isFetchingSchema, handleFetchSchema } = useGraphqlSchema(activeId);

  useUrlParamsSync(activeId);

  const getDomainFromUrl = (url) => { 
    try { return new URL(url).hostname; } catch { return ''; } 
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      
      <GraphqlHeader 
        activeId={activeId}
        configTab={configTab}
        setConfigTab={setConfigTab}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenCookieModal={() => setIsCookieModalOpen(true)}
      />

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-bg-base">
        {configTab === 'Query' && (
          <Editor
            height="100%"
            defaultLanguage="graphql"
            value={activeReqState.config?.body?.graphql?.query || ''}
            theme="vs-dark"
            onChange={(val) => store.updateActiveRequestDeep(['config', 'body', 'graphql', 'query'], val || '')}
            options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, padding: { top: 16 } }}
          />
        )}
        
        {configTab === 'Variables' && (
          <Editor
            height="100%"
            defaultLanguage="json"
            value={activeReqState.config?.body?.graphql?.variables || ''}
            theme="vs-dark"
            onChange={(val) => store.updateActiveRequestDeep(['config', 'body', 'graphql', 'variables'], val || '')}
            options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, padding: { top: 16 } }}
          />
        )}
        
        {configTab === 'Headers' && <HeadersEditor />}
        {configTab === 'Cookies' && <CookiesEditor />}
        {configTab === 'Authorization' && <AuthEditor />}
        {configTab === 'Schema' && <SchemaViewer schema={schema} isLoading={isFetchingSchema} onFetch={handleFetchSchema} />}
        {configTab === 'Docs' && <NotesEditor />}
      </div>

      {/* Resizer Handle */}
      <div 
        onMouseDown={startResize} 
        className="h-1 bg-border-subtle hover:bg-brand-primary cursor-row-resize shrink-0 relative z-20" 
      />
      
      {/* Response Pane */}
      <div style={{ height: store.responsePaneHeight }} className="shrink-0 overflow-hidden border-t border-border-subtle relative z-10">
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
