'use client';
import { Handle, Position } from '@xyflow/react';
import { Flag, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EndNode({ data, selected }) {
  const { executionStatus } = data;

  return (
    <div className="relative group" style={{ filter: selected ? 'drop-shadow(0 0 12px rgba(239,68,68,0.4))' : undefined }}>
      {selected && <div className="absolute inset-0 rounded-2xl border-2 border-red-400/60 animate-pulse pointer-events-none" />}

      <div className={`relative bg-gradient-to-br from-[#1f0d0d] to-[#1a0a0a] border rounded-2xl shadow-xl min-w-[160px] transition-all duration-200 overflow-hidden
        ${executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
          executionStatus === 'failed'  ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' :
          'border-red-900/60 hover:border-red-700/60'}`}
      >
        <div className="h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-transparent" />

        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
            {executionStatus === 'success' ? <CheckCircle2 size={14} className="text-emerald-400" /> :
             executionStatus === 'failed'  ? <AlertCircle  size={14} className="text-red-400" /> :
             <Flag size={14} className="text-red-400" />}
          </div>
          <div>
            <p className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest leading-none mb-0.5">Terminal</p>
            <p className="text-sm font-bold text-white leading-none">End</p>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className={`flex items-center gap-1.5 text-[10px] rounded-md px-2 py-1.5 border
            ${executionStatus === 'success' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' :
              executionStatus === 'failed'  ? 'text-red-400 bg-red-500/5 border-red-500/20' :
              'text-red-500/60 bg-red-500/5 border-red-500/10'}`}
          >
            <Flag size={10} className="shrink-0" />
            <span>{executionStatus === 'success' ? 'Completed successfully' :
                   executionStatus === 'failed'  ? 'Workflow failed' :
                   'Workflow terminates here'}</span>
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-red-500 !border-2 !border-[#1a0a0a] transition-transform group-hover:!scale-125"
      />
    </div>
  );
}