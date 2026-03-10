'use client';
import { Handle, Position } from '@xyflow/react';
import { Play, Zap } from 'lucide-react';

export default function StartNode({ data, selected }) {
  return (
    <div
      className="relative group"
      style={{ filter: selected ? 'drop-shadow(0 0 12px rgba(16,185,129,0.5))' : undefined }}
    >
      {/* Animated ring when selected */}
      {selected && (
        <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/60 animate-pulse pointer-events-none" />
      )}

      <div
        className={`relative bg-gradient-to-br from-[#0d1f17] to-[#0a1a12] border rounded-2xl shadow-xl min-w-[160px] transition-all duration-200 overflow-hidden
          ${data.executionStatus === 'running'
            ? 'border-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.4)]'
            : 'border-emerald-900/60 hover:border-emerald-600/60'
          }`}
      >
        {/* Top accent bar */}
        <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />

        <div className="px-4 py-3 flex items-center gap-3">
          {/* Icon bubble */}
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Play size={14} className="text-emerald-400" fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest leading-none mb-0.5">Trigger</p>
            <p className="text-sm font-bold text-white leading-none">Start</p>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-500/60 bg-emerald-500/5 border border-emerald-500/10 rounded-md px-2 py-1.5">
            <Zap size={10} className="text-emerald-400 shrink-0" />
            <span>Workflow entry point</span>
          </div>
        </div>

        {/* Running animation shimmer */}
        {data.executionStatus === 'running' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent animate-[shimmer_1.5s_infinite]" />
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-emerald-500 !border-2 !border-[#0a1a12] transition-transform group-hover:!scale-125"
      />
    </div>
  );
}