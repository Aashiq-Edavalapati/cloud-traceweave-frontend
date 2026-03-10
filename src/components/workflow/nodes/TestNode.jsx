'use client';
import { Handle, Position } from '@xyflow/react';
import { FlaskConical, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TestNode({ data, selected }) {
  const { executionStatus, assertion } = data;

  return (
    <div className="relative group" style={{ filter: selected ? 'drop-shadow(0 0 14px rgba(236,72,153,0.4))' : undefined }}>
      {selected && <div className="absolute inset-0 rounded-2xl border-2 border-pink-400/60 animate-pulse pointer-events-none" />}

      <div className={`relative bg-gradient-to-br from-[#1f0d1a] to-[#1a0a14] border rounded-2xl shadow-xl min-w-[240px] max-w-[280px] transition-all duration-200 overflow-hidden
        ${executionStatus === 'running' ? 'border-pink-400 shadow-[0_0_24px_rgba(236,72,153,0.4)]' :
          executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.3)]' :
          executionStatus === 'failed'  ? 'border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.4)]' :
          'border-pink-900/50 hover:border-pink-700/50'}`}
      >
        <div className="h-0.5 bg-gradient-to-r from-pink-500 via-pink-400 to-transparent" />

        {/* Header */}
        <div className="px-3 py-2.5 flex items-center justify-between bg-pink-500/5 border-b border-pink-900/30">
          <div className="flex items-center gap-2">
            <FlaskConical size={13} className="text-pink-400 shrink-0" />
            <span className="text-xs font-bold text-white">Test Assertion</span>
          </div>
          <div className="flex items-center gap-1.5">
            {executionStatus === 'running' && <Loader2 size={13} className="text-pink-400 animate-spin" />}
            {executionStatus === 'success' && <CheckCircle2 size={13} className="text-emerald-400" />}
            {executionStatus === 'failed'  && <AlertCircle  size={13} className="text-red-400" />}
          </div>
        </div>

        {/* Assertion */}
        <div className="px-3 py-2.5">
          <div className="text-[11px] font-mono text-pink-300/80 bg-pink-500/5 border border-pink-500/15 rounded-lg px-2.5 py-2 truncate" title={assertion}>
            {assertion || <span className="text-white/25 italic">No assertion set</span>}
          </div>

          {data.error && (
            <div className="mt-2 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1.5">
              ✗ {data.error}
            </div>
          )}
        </div>

        {/* Branch labels */}
        <div className="px-3 pb-2.5 flex items-center justify-end gap-2 text-[9px] font-black">
          <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">PASS ↑</span>
          <span className="text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">FAIL ↓</span>
        </div>

        {executionStatus === 'running' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/5 to-transparent animate-[shimmer_1.2s_ease-in-out_infinite]" />
        )}
      </div>

      <Handle type="target" position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-pink-500 !border-2 !border-[#1a0a14] transition-transform group-hover:!scale-125" />
      <Handle type="source" position={Position.Right} id="pass" style={{ top: '38%' }}
        className="!w-3.5 !h-3.5 !bg-emerald-500 !border-2 !border-[#1a0a14]" />
      <Handle type="source" position={Position.Right} id="fail" style={{ top: '68%' }}
        className="!w-3.5 !h-3.5 !bg-red-500 !border-2 !border-[#1a0a14]" />
    </div>
  );
}