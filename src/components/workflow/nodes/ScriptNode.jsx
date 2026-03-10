'use client';
import { Handle, Position } from '@xyflow/react';
import { Terminal, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ScriptNode({ data, selected }) {
  const { executionStatus, script } = data;

  // Show first non-empty, non-comment line as preview
  const previewLine = (script || '')
    .split('\n')
    .find(l => l.trim() && !l.trim().startsWith('//'));

  return (
    <div className="relative group" style={{ filter: selected ? 'drop-shadow(0 0 14px rgba(34,211,238,0.4))' : undefined }}>
      {selected && <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/60 animate-pulse pointer-events-none" />}

      <div className={`relative bg-gradient-to-br from-[#061820] to-[#041218] border rounded-2xl shadow-xl min-w-[240px] max-w-[280px] transition-all duration-200 overflow-hidden
        ${executionStatus === 'running' ? 'border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.4)]' :
          executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.3)]' :
          executionStatus === 'failed'  ? 'border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.4)]' :
          'border-cyan-900/40 hover:border-cyan-700/50'}`}
      >
        <div className="h-0.5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-transparent" />

        {/* Header with fake window chrome dots */}
        <div className="px-3 py-2.5 flex items-center justify-between bg-cyan-500/5 border-b border-cyan-900/30">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500/60" />
              <div className="w-2 h-2 rounded-full bg-amber-500/60" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
            </div>
            <Terminal size={12} className="text-cyan-400 ml-1 shrink-0" />
            <span className="text-xs font-bold text-white">Script</span>
          </div>
          <div className="flex items-center gap-1.5">
            {executionStatus === 'running' && <Loader2 size={13} className="text-cyan-400 animate-spin" />}
            {executionStatus === 'success' && <CheckCircle2 size={13} className="text-emerald-400" />}
            {executionStatus === 'failed'  && <AlertCircle  size={13} className="text-red-400" />}
          </div>
        </div>

        {/* Code preview */}
        <div className="px-3 py-2.5">
          <div className="text-[10px] font-mono bg-black/40 border border-cyan-500/10 rounded-lg px-2.5 py-2 space-y-0.5 min-h-[42px]">
            {script ? (
              script.split('\n').slice(0, 3).map((line, i) => (
                <div key={i} className="flex gap-2 leading-relaxed">
                  <span className="text-white/20 select-none w-3 text-right shrink-0">{i + 1}</span>
                  <span className={`truncate ${line.trim().startsWith('//') ? 'text-white/25' : 'text-cyan-300/80'}`}>{line || ' '}</span>
                </div>
              ))
            ) : (
              <div className="flex gap-2 leading-relaxed">
                <span className="text-white/20 select-none">1</span>
                <span className="text-white/20 italic">// write custom JS here</span>
              </div>
            )}
          </div>

          {data.error && (
            <div className="mt-2 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1.5">
              ✗ {data.error}
            </div>
          )}
        </div>

        {executionStatus === 'running' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-[shimmer_1.2s_ease-in-out_infinite]" />
        )}
      </div>

      <Handle type="target" position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-cyan-400 !border-2 !border-[#041218] transition-transform group-hover:!scale-125" />
      <Handle type="source" position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-cyan-400 !border-2 !border-[#041218] transition-transform group-hover:!scale-125" />
    </div>
  );
}