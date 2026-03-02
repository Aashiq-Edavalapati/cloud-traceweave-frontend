'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { ArrowLeft, Clock, Server, ArrowDownToLine, ArrowUpFromLine, Activity } from 'lucide-react';
import { PacmanLoader } from 'react-spinners';

// Helper to safely format JSON
const formatJson = (data) => {
  if (!data) return 'No data';
  if (typeof data === 'string') {
    try { return JSON.stringify(JSON.parse(data), null, 2); } 
    catch (e) { return data; }
  }
  return JSON.stringify(data, null, 2);
};

const getStatusColor = (code) => {
  if (!code) return 'text-text-muted';
  if (code >= 200 && code < 300) return 'text-emerald-500';
  if (code >= 300 && code < 400) return 'text-blue-500';
  if (code >= 400 && code < 500) return 'text-amber-500';
  return 'text-red-500';
};

export default function ExecutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { execId } = params;
  
  const { activeExecution: log, isHistoryLoading, fetchExecutionDetails, clearActiveExecution } = useAppStore();

  useEffect(() => {
    if (execId) fetchExecutionDetails(execId);
    return () => clearActiveExecution(); // Cleanup on unmount
  }, [execId]);

  if (isHistoryLoading || !log) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-screen text-text-secondary">
        <PacmanLoader color="#FF6F00" size={20} />
        <p className="mt-4 text-sm font-mono animate-pulse">Loading execution details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col p-8 max-w-7xl mx-auto w-full">
      {/* 1. Header (Back button & Summary) */}
      <div className="mb-6">
        <button 
          onClick={() => router.push('/history')}
          className="flex items-center gap-2 text-text-muted hover:text-brand-orange transition-colors mb-4 text-sm"
        >
          <ArrowLeft size={16} /> Back to History
        </button>

        <div className="bg-bg-panel border border-border-subtle p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1.5 rounded-lg border font-bold text-sm bg-bg-base ${getStatusColor(log.status)} border-border-subtle`}>
              {log.status || 'ERR'} {log.statusText}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-brand-orange">{log.method}</span>
                <span className="text-text-primary font-mono text-sm">{log.url}</span>
              </div>
              <p className="text-xs text-text-muted mt-1 flex items-center gap-2">
                <Clock size={12} /> {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-border-subtle pt-4 md:pt-0 md:pl-6">
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Time</p>
              <p className="text-sm font-mono font-bold text-emerald-500">{log.timings?.total || 0} ms</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Size</p>
              <p className="text-sm font-mono font-bold">{log.responseSize ? (log.responseSize / 1024).toFixed(2) : 0} KB</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid Layout for Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Request & Response) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Response Payload */}
          <div className="bg-bg-panel border border-border-subtle rounded-xl overflow-hidden">
            <div className="border-b border-border-subtle p-4 bg-bg-base/50 flex items-center gap-2">
              <ArrowDownToLine size={16} className="text-brand-blue" />
              <h2 className="font-bold text-sm">Response Body</h2>
            </div>
            <div className="p-0">
              <pre className="p-4 text-xs font-mono text-text-secondary bg-[#0d0d0d] overflow-x-auto max-h-[400px] custom-scrollbar">
                {formatJson(log.responseBody)}
              </pre>
            </div>
          </div>

          {/* Request Payload */}
          <div className="bg-bg-panel border border-border-subtle rounded-xl overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
            <div className="border-b border-border-subtle p-4 bg-bg-base/50 flex items-center gap-2">
              <ArrowUpFromLine size={16} className="text-brand-orange" />
              <h2 className="font-bold text-sm">Request Body</h2>
            </div>
            <div className="p-0">
              <pre className="p-4 text-xs font-mono text-text-secondary bg-[#0d0d0d] overflow-x-auto max-h-[300px] custom-scrollbar">
                {formatJson(log.requestBody)}
              </pre>
            </div>
          </div>
        </div>

        {/* Right Column (Headers & Waterfall) */}
        <div className="space-y-6">
          {/* Timing Waterfall */}
          <div className="bg-bg-panel border border-border-subtle rounded-xl overflow-hidden">
            <div className="border-b border-border-subtle p-4 bg-bg-base/50 flex items-center gap-2">
              <Activity size={16} className="text-emerald-500" />
              <h2 className="font-bold text-sm">Timing Waterfall</h2>
            </div>
            <div className="p-4 space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center"><span className="text-text-muted">DNS Lookup:</span> <span>{log.timings?.dnsLookup || 0} ms</span></div>
              <div className="flex justify-between items-center"><span className="text-text-muted">TCP Connection:</span> <span>{log.timings?.tcpConnection || 0} ms</span></div>
              <div className="flex justify-between items-center"><span className="text-text-muted">TLS Handshake:</span> <span>{log.timings?.tlsHandshake || 0} ms</span></div>
              <div className="flex justify-between items-center"><span className="text-text-muted">First Byte (TTFB):</span> <span>{log.timings?.firstByte || 0} ms</span></div>
              <div className="flex justify-between items-center"><span className="text-text-muted">Download:</span> <span>{log.timings?.download || 0} ms</span></div>
              <div className="border-t border-border-subtle pt-2 mt-2 flex justify-between items-center font-bold text-emerald-500">
                <span>Total Time:</span> <span>{log.timings?.total || 0} ms</span>
              </div>
            </div>
          </div>

          {/* Response Headers */}
          <div className="bg-bg-panel border border-border-subtle rounded-xl overflow-hidden">
            <div className="border-b border-border-subtle p-4 bg-bg-base/50 flex items-center gap-2">
              <Server size={16} className="text-purple-400" />
              <h2 className="font-bold text-sm">Response Headers</h2>
            </div>
            <div className="p-4">
              <ul className="text-xs font-mono space-y-2 overflow-x-auto custom-scrollbar max-h-[300px]">
                {log.responseHeaders && Object.entries(log.responseHeaders).map(([key, value]) => (
                  <li key={key} className="flex flex-col sm:flex-row sm:gap-2">
                    <span className="text-text-muted font-bold w-1/3 truncate">{key}:</span>
                    <span className="text-text-primary flex-1 break-all">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}