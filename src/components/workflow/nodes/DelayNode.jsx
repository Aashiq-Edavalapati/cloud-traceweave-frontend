'use client';
import { Handle, Position } from '@xyflow/react';
import { Timer, Loader2, CheckCircle2 } from 'lucide-react';

const formatDelay = (ms) => {
  if (!ms) return '1s';
  if (ms >= 1000) return `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)}s`;
  return `${ms}ms`;
};

export default function DelayNode({ data, selected }) {
  const { executionStatus, delay = 1000 } = data;
  const progress = executionStatus === 'running' ? '60%' : executionStatus === 'success' ? '100%' : '0%';

  return (
    <div className="relative group" style={{ filter: selected ? 'drop-shadow(0 0 14px rgba(245,158,11,0.4))' : undefined }}>
      {selected && <div className="absolute inset-0 rounded-2xl border-2 border-amber-400/60 animate-pulse pointer-events-none" />}

      <div className={`relative bg-gradient-to-br from-[#1c1505] to-[#150f00] border rounded-2xl shadow-xl min-w-[160px] transition-all duration-200 overflow-hidden
        ${executionStatus === 'running' ? 'border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.4)]' :
          executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.3)]' :
          'border-amber-900/50 hover:border-amber-700/50'}`}
      >
        <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />

        {/* Header */}
        <div className="px-3 py-2.5 flex items-center justify-between bg-amber-500/5 border-b border-amber-900/30">
          <div className="flex items-center gap-2">
            <Timer size={13} className="text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-white">Delay</span>
          </div>
          <div>
            {executionStatus === 'running' && <Loader2 size={13} className="text-amber-400 animate-spin" />}
            {executionStatus === 'success' && <CheckCircle2 size={13} className="text-emerald-400" />}
          </div>
        </div>

        {/* Time display */}
        <div className="px-3 py-3 flex flex-col items-center gap-2">
          <div className="text-2xl font-black text-amber-400 tracking-tight font-mono">
            {formatDelay(delay)}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-[var(--delay)] ease-linear
                ${executionStatus === 'success' ? 'bg-emerald-500' : 'bg-amber-400'}`}
              style={{
                width: progress,
                '--delay': executionStatus === 'running' ? `${delay}ms` : '300ms',
              }}
            />
          </div>
        </div>

        {executionStatus === 'running' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite]" />
        )}
      </div>

      <Handle type="target" position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-amber-500 !border-2 !border-[#150f00] transition-transform group-hover:!scale-125" />
      <Handle type="source" position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-amber-500 !border-2 !border-[#150f00] transition-transform group-hover:!scale-125" />
    </div>
  );
}