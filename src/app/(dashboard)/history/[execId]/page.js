'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { 
  ArrowLeft, Clock, Server, ArrowDownToLine, 
  ArrowUpFromLine, Activity, Copy, Check, 
  MessageSquare, ArrowRightLeft, File, FileText 
} from 'lucide-react';
import { PacmanLoader } from 'react-spinners';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- UTILS ---
const formatJson = (data) => {
  if (data === undefined || data === null || data === '') return '';
  if (typeof data === 'string') {
    try { return JSON.stringify(JSON.parse(data), null, 2); } 
    catch (e) { return data; }
  }
  return JSON.stringify(data, null, 2);
};

const getStatusColor = (code) => {
  if (!code) return 'text-text-muted';
  if (code === 101) return 'text-purple-400';
  if (code >= 200 && code < 300) return 'text-emerald-500';
  if (code >= 300 && code < 400) return 'text-blue-500';
  if (code >= 400 && code < 500) return 'text-amber-500';
  return 'text-red-500';
};

const getMethodColor = (method, protocol) => {
  if (protocol === 'ws') return 'text-purple-400';
  const m = method?.toUpperCase() || '';
  if (m === 'GET') return 'text-blue-400';
  if (m === 'POST') return 'text-emerald-400';
  if (m === 'PUT' || m === 'PATCH') return 'text-amber-400';
  if (m === 'DELETE') return 'text-red-400';
  return 'text-brand-orange';
};

// --- COMPONENTS ---
const CopyButton = ({ textValue }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!textValue) return;
    navigator.clipboard.writeText(textValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  if (!textValue) return null;
  return (
    <button 
      onClick={handleCopy}
      className="p-1.5 rounded hover:bg-bg-input text-text-muted hover:text-text-primary transition-colors flex items-center justify-center"
      title="Copy"
    >
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  );
};

const HeadersDisplay = ({ headers }) => {
  if (!headers || Object.keys(headers).length === 0) {
    return <div className="p-8 text-center text-sm text-text-muted font-mono italic">No headers available</div>;
  }
  return (
    <div className="flex flex-col text-[12px] font-mono divide-y divide-border-subtle">
      {Object.entries(headers).map(([key, value]) => (
        <div key={key} className="flex px-6 py-3 hover:bg-bg-base/40 transition-colors">
          <span className="text-text-muted font-semibold w-1/4 shrink-0">{key}</span>
          <span className="text-emerald-400 break-all">{String(value)}</span>
        </div>
      ))}
    </div>
  );
};

// ✨ NEW: Smart Request Body Renderer (Handles Form-Data & Files without crashing)
const RequestBodyDisplay = ({ body }) => {
  if (!body) return <div className="p-8 text-center text-sm text-text-muted font-mono italic">No request body</div>;

  // Render FormData (Files + Text)
  if (body.type === 'formdata') {
    return (
      <div className="flex flex-col text-[12px] font-mono divide-y divide-border-subtle">
        {body.formdata?.map((item, i) => (
          <div key={i} className="flex px-6 py-3 hover:bg-bg-base/40 transition-colors items-center">
            <span className="text-text-muted font-semibold w-1/4 shrink-0 truncate">{item.key || 'unnamed'}</span>
            <div className="flex-1">
              {item.isFile ? (
                <div className="inline-flex items-center gap-2 text-brand-orange bg-brand-orange/10 px-2 py-1 rounded border border-brand-orange/20">
                  <File size={14} />
                  <span className="truncate max-w-[200px]">{item.value?.name || 'File Uploaded'}</span>
                  <span className="text-[10px] bg-bg-base px-1.5 rounded text-text-muted ml-1">{item.value?.type || 'binary'}</span>
                </div>
              ) : (
                <span className="text-emerald-400 break-all">{String(item.value)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render URL Encoded
  if (body.type === 'urlencoded') {
    return (
      <div className="flex flex-col text-[12px] font-mono divide-y divide-border-subtle">
        {body.urlencoded?.map((item, i) => (
          <div key={i} className="flex px-6 py-3 hover:bg-bg-base/40 transition-colors items-center">
            <span className="text-text-muted font-semibold w-1/4 shrink-0 truncate">{item.key || 'unnamed'}</span>
            <span className="text-emerald-400 break-all">{String(item.value)}</span>
          </div>
        ))}
      </div>
    );
  }

  // Render Single Binary File
  if (body.type === 'binary') {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 text-brand-orange bg-brand-orange/5 p-4 rounded-lg border border-brand-orange/20 max-w-sm">
          <FileText size={24} />
          <div className="flex flex-col">
            <span className="font-semibold text-sm font-mono">{body.binaryFile?.name || 'Binary Data Attached'}</span>
            <span className="text-xs text-text-muted font-mono">{body.binaryFile?.type || 'application/octet-stream'}</span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to Raw/GraphQL JSON rendering
  const rawData = body.raw || formatJson(body);
  return (
    <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '13px' }}>
      {rawData}
    </SyntaxHighlighter>
  );
};

const WsMessageTimeline = ({ messages }) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return <div className="p-8 text-center text-sm text-text-muted font-mono italic">No messages recorded in this session.</div>;
  }
  return (
    <div className="flex flex-col gap-4 p-6 overflow-y-auto custom-scrollbar h-full">
      {messages.map((msg, idx) => {
        const isOutgoing = msg.direction === 'outgoing';
        return (
          <div key={idx} className={`flex flex-col max-w-[80%] ${isOutgoing ? 'self-end items-end' : 'self-start items-start'}`}>
            <div className="flex items-center gap-2 mb-1.5 px-1">
              {isOutgoing ? <ArrowUpFromLine size={12} className="text-brand-orange" /> : <ArrowDownToLine size={12} className="text-emerald-500" />}
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                {isOutgoing ? 'Sent' : 'Received'}
              </span>
              <span className="text-[10px] text-text-muted font-mono ml-2">
                {new Date(msg.time).toLocaleTimeString()}
              </span>
            </div>
            <div className={`p-3 rounded-lg border text-[13px] font-mono break-all ${
              isOutgoing 
                ? 'bg-brand-orange/10 border-brand-orange/20 text-text-primary rounded-tr-none' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 rounded-tl-none'
            }`}>
              {msg.data}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function ExecutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { execId } = params;
  
  const { activeExecution: log, isHistoryLoading, fetchExecutionDetails, clearActiveExecution } = useAppStore();
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (execId) fetchExecutionDetails(execId);
    return () => clearActiveExecution();
  }, [execId, fetchExecutionDetails, clearActiveExecution]);

  useEffect(() => {
    if (log) {
      if (log.protocol === 'ws') setActiveTab('ws-messages');
      else setActiveTab('res-body');
    }
  }, [log]);

  if (isHistoryLoading || !log) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-bg-base text-text-secondary">
        <PacmanLoader color="#EAC2FF" size={20} />
      </div>
    );
  }

  const isWs = log.protocol === 'ws';
  const formattedResBody = !isWs ? formatJson(log.responseBody) : '';

  const tabs = isWs ? [
    { id: 'ws-messages', label: 'Message History', icon: MessageSquare },
    { id: 'req-headers', label: 'Connection Headers', icon: Server },
  ] : [
    { id: 'req-headers', label: 'Req Headers', icon: Server },
    { id: 'req-body', label: 'Req Body', icon: ArrowUpFromLine },
    { id: 'res-headers', label: 'Res Headers', icon: Server },
    { id: 'res-body', label: 'Res Body', icon: ArrowDownToLine },
    { id: 'waterfall', label: 'Waterfall', icon: Activity },
  ];

  return (
    // ✨ Full bleed, IDE-like layout
    <div className="h-screen bg-bg-base text-text-primary flex flex-col w-full overflow-hidden">
      
      {/* 1. Header Area */}
      <div className="flex flex-col shrink-0">
        {/* Nav Bar */}
        <div className="flex items-center px-6 py-3 border-b border-border-subtle bg-bg-panel/40">
          <button 
            onClick={() => router.push('/history')}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> History
          </button>
          <div className="ml-auto text-xs text-text-muted font-mono flex items-center gap-2">
            <Clock size={12} /> {new Date(log.createdAt).toLocaleString()}
          </div>
        </div>

        {/* Overview Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 border-b border-border-subtle bg-bg-base">
          <div className="flex items-center gap-4">
            <span className={`font-bold text-lg w-14 text-center ${getMethodColor(log.method, log.protocol)}`}>
              {isWs ? 'WS' : log.method}
            </span>
            <div className="h-8 w-px bg-border-subtle hidden md:block"></div>
            <span className="text-text-primary font-mono text-base break-all flex-1">{log.url}</span>
          </div>
          
          <div className="flex items-center gap-6 shrink-0 md:pl-6 md:border-l border-border-subtle">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Status</span>
              <span className={`font-mono font-bold text-sm ${getStatusColor(log.status)}`}>
                {log.status || 'ERR'} {log.statusText}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Time</span>
              <span className="font-mono font-bold text-sm text-emerald-500">{log.timings?.total || 0} ms</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Size</span>
              <span className="font-mono font-bold text-sm text-text-primary">
                {log.responseSize ? (log.responseSize / 1024).toFixed(2) : 0} KB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Content Area (Split Pane Feel) */}
      <div className="flex flex-col flex-1 overflow-hidden bg-[#141414]">
        
        {/* Tab Bar */}
        <div className="flex items-center px-4 border-b border-border-subtle bg-bg-panel/20 shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  isActive 
                    ? 'border-brand-purple text-text-primary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-brand-purple' : ''} />
                {tab.label}
              </button>
            );
          })}
          
          {/* Action Buttons */}
          <div className="ml-auto flex items-center">
            {activeTab === 'res-body' && !isWs && <CopyButton textValue={formattedResBody} />}
            {activeTab === 'req-headers' && <CopyButton textValue={JSON.stringify(log.requestHeaders, null, 2)} />}
          </div>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'req-headers' && <HeadersDisplay headers={log.requestHeaders} />}
          {activeTab === 'res-headers' && !isWs && <HeadersDisplay headers={log.responseHeaders} />}
          
          {/* Form-Data / JSON Smart Renderer */}
          {activeTab === 'req-body' && !isWs && <RequestBodyDisplay body={log.requestBody} />}

          {activeTab === 'res-body' && !isWs && (
            formattedResBody ? (
              <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '13px' }}>
                {formattedResBody}
              </SyntaxHighlighter>
            ) : <div className="p-8 text-center text-sm text-text-muted font-mono italic">No response body</div>
          )}

          {activeTab === 'ws-messages' && isWs && <WsMessageTimeline messages={log.responseBody} />}

          {activeTab === 'waterfall' && !isWs && (
            <div className="p-8 max-w-2xl">
              {log.timings?.total !== undefined ? (
                <>
                  <div className="mb-8 border-b border-border-subtle pb-4">
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">Network Timing</h3>
                    <p className="text-xs text-text-muted">A breakdown of the request lifecycle.</p>
                  </div>
                  <TimingBar label="DNS Lookup" value={log.timings.dnsLookup} startPercent={0} widthPercent={((log.timings.dnsLookup || 0) / log.timings.total) * 100} colorClass="bg-teal-500" />
                  <TimingBar label="TCP Connection" value={log.timings.tcpConnection} startPercent={((log.timings.dnsLookup || 0) / log.timings.total) * 100} widthPercent={((log.timings.tcpConnection || 0) / log.timings.total) * 100} colorClass="bg-amber-500" />
                  <TimingBar label="TLS Handshake" value={log.timings.tlsHandshake} startPercent={((log.timings.dnsLookup || 0 + log.timings.tcpConnection || 0) / log.timings.total) * 100} widthPercent={((log.timings.tlsHandshake || 0) / log.timings.total) * 100} colorClass="bg-purple-500" />
                  <TimingBar label="First Byte (TTFB)" value={log.timings.firstByte} startPercent={((log.timings.dnsLookup || 0 + log.timings.tcpConnection || 0 + log.timings.tlsHandshake || 0) / log.timings.total) * 100} widthPercent={((log.timings.firstByte || 0) / log.timings.total) * 100} colorClass="bg-blue-500" />
                  <TimingBar label="Download" value={log.timings.download} startPercent={((log.timings.dnsLookup || 0 + log.timings.tcpConnection || 0 + log.timings.tlsHandshake || 0 + log.timings.firstByte || 0) / log.timings.total) * 100} widthPercent={((log.timings.download || 0) / log.timings.total) * 100} colorClass="bg-emerald-500" />
                </>
              ) : (
                <div className="text-center text-sm text-text-muted font-mono italic">No timing data available</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}