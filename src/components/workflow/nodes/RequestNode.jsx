'use client';
import { Handle, Position } from '@xyflow/react';
import { Globe, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const METHOD_STYLES = {
  GET:    { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  POST:   { bg: 'bg-blue-500/15',   text: 'text-blue-400',    border: 'border-blue-500/30' },
  PUT:    { bg: 'bg-amber-500/15',  text: 'text-amber-400',   border: 'border-amber-500/30' },
  PATCH:  { bg: 'bg-orange-500/15', text: 'text-orange-400',  border: 'border-orange-500/30' },
  DELETE: { bg: 'bg-red-500/15',    text: 'text-red-400',     border: 'border-red-500/30' },
};

export default function RequestNode({ data, selected }) {
  const { executionStatus, method = 'GET', url = '', requestId } = data;
  const liveRequest = useAppStore((state) => state.requestStates[requestId]);
  const displayMethod = (liveRequest?.method || method || 'GET').toUpperCase();
  const displayUrl = liveRequest?.url || url || '';
  const displayName = liveRequest?.name || 'Untitled Request';
  const ms = displayMethod;
  const mStyle = METHOD_STYLES[ms] || METHOD_STYLES.GET;

  // Strip protocol for cleaner display
  const cleanUrl = displayUrl.replace(/^https?:\/\//, '').split('?')[0];

  return (
    <div className="relative group" style={{ filter: selected ? 'drop-shadow(0 0 14px rgba(59,130,246,0.4))' : undefined }}>
      {selected && <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/60 animate-pulse pointer-events-none" />}

      <div className={`relative bg-gradient-to-br from-[#0d1525] to-[#0a1020] border rounded-2xl shadow-xl min-w-[240px] max-w-[280px] transition-all duration-200 overflow-hidden
        ${executionStatus === 'running' ? 'border-blue-400 shadow-[0_0_24px_rgba(59,130,246,0.4)]' :
          executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.3)]' :
          executionStatus === 'failed'  ? 'border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.4)]' :
          'border-blue-900/50 hover:border-blue-700/50'}`}
      >
        <div className="h-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />

        {/* Header */}
        <div className="px-3 py-2.5 flex items-center justify-between bg-blue-500/5 border-b border-blue-900/30">
          <div className="flex items-center gap-2">
            <Globe size={13} className="text-blue-400 shrink-0" />
            <span className="text-xs font-bold text-white truncate max-w-[140px]">{displayName}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {executionStatus === 'running' && <Loader2 size={13} className="text-blue-400 animate-spin" />}
            {executionStatus === 'success' && <CheckCircle2 size={13} className="text-emerald-400" />}
            {executionStatus === 'failed'  && <AlertCircle  size={13} className="text-red-400" />}
          </div>
        </div>

        {/* Body */}
        <div className="px-3 py-2.5 space-y-2">
          {/* Method + URL */}
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${mStyle.bg} ${mStyle.text} ${mStyle.border}`}>
              {displayMethod}
            </span>
            <span className="text-[11px] font-mono text-white/50 truncate">
              {cleanUrl || <span className="text-white/25 italic">No URL configured</span>}
            </span>
          </div>

          {/* Timeout badge */}
          {data.timeout && (
            <div className="flex items-center gap-1 text-[10px] text-white/30">
              <Clock size={9} />
              <span>{data.timeout}ms timeout</span>
            </div>
          )}

          {/* Error display */}
          {data.error && executionStatus === 'failed' && (
            <div className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1.5 leading-snug">
              ✗ {data.error}
            </div>
          )}

          {/* No request configured state */}
          {!data.requestId && (
            <div className="text-[10px] text-amber-400/70 bg-amber-500/5 border border-amber-500/15 rounded-lg px-2 py-1.5">
              ⚡ Click to configure request
            </div>
          )}
        </div>

        {/* Running shimmer */}
        {executionStatus === 'running' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-[shimmer_1.2s_ease-in-out_infinite]" />
        )}
      </div>

      <Handle type="target" position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-blue-500 !border-2 !border-[#0a1020] transition-transform group-hover:!scale-125" />
      <Handle type="source" position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-blue-500 !border-2 !border-[#0a1020] transition-transform group-hover:!scale-125" />
    </div>
  );
}