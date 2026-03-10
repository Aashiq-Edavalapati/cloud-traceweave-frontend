'use client';
import { Handle, Position } from '@xyflow/react';
import { FileJson, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function TransformNode({ data, selected }) {
  const { executionStatus, variable, expression } = data;

  return (
    <div className="relative group" style={{ filter: selected ? 'drop-shadow(0 0 14px rgba(96,165,250,0.4))' : undefined }}>
      {selected && <div className="absolute inset-0 rounded-2xl border-2 border-blue-300/60 animate-pulse pointer-events-none" />}

      <div className={`relative bg-gradient-to-br from-[#0d1830] to-[#0a1228] border rounded-2xl shadow-xl min-w-[240px] max-w-[280px] transition-all duration-200 overflow-hidden
        ${executionStatus === 'running' ? 'border-blue-300 shadow-[0_0_24px_rgba(96,165,250,0.4)]' :
          executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.3)]' :
          executionStatus === 'failed'  ? 'border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.4)]' :
          'border-blue-900/40 hover:border-blue-700/50'}`}
      >
        <div className="h-0.5 bg-gradient-to-r from-blue-300 via-blue-400 to-transparent" />

        {/* Header */}
        <div className="px-3 py-2.5 flex items-center justify-between bg-blue-400/5 border-b border-blue-900/30">
          <div className="flex items-center gap-2">
            <FileJson size={13} className="text-blue-300 shrink-0" />
            <span className="text-xs font-bold text-white">Transform</span>
          </div>
          <div className="flex items-center gap-1.5">
            {executionStatus === 'running' && <Loader2 size={13} className="text-blue-300 animate-spin" />}
            {executionStatus === 'success' && <CheckCircle2 size={13} className="text-emerald-400" />}
            {executionStatus === 'failed'  && <AlertCircle  size={13} className="text-red-400" />}
          </div>
        </div>

        {/* Mapping preview */}
        <div className="px-3 py-2.5 space-y-1.5">
          {variable || expression ? (
            <div className="flex items-center gap-1.5 text-[11px] font-mono bg-blue-500/5 border border-blue-500/15 rounded-lg px-2.5 py-2">
              <span className="text-purple-300 truncate max-w-[80px]">{variable || '…'}</span>
              <ArrowRight size={10} className="text-white/30 shrink-0" />
              <span className="text-blue-300 truncate">{expression || '…'}</span>
            </div>
          ) : (
            <div className="text-[10px] text-white/25 bg-blue-500/5 border border-blue-500/10 rounded-lg px-2.5 py-2 italic">
              Click to set variable mapping
            </div>
          )}

          {data.error && (
            <div className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1.5">
              ✗ {data.error}
            </div>
          )}
        </div>

        {executionStatus === 'running' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent animate-[shimmer_1.2s_ease-in-out_infinite]" />
        )}
      </div>

      <Handle type="target" position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-blue-300 !border-2 !border-[#0a1228] transition-transform group-hover:!scale-125" />
      <Handle type="source" position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-blue-300 !border-2 !border-[#0a1228] transition-transform group-hover:!scale-125" />
    </div>
  );
}