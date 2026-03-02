import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Download, Info, ChevronRight } from 'lucide-react';

function byteSize(str) { const b = new Blob([str]).size; return b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`; }
function prettyPrint(str) { try { return JSON.stringify(JSON.parse(str), null, 2); } catch { return str; } }

export default function LogEntry({ log, index }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = useCallback((e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(log.msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [log.msg]);

  const pretty = prettyPrint(log.msg);
  const size = byteSize(log.msg);

  const dirIcon =
    log.type === 'out' ? <span className="text-brand-primary font-bold text-[10px]">↑</span>
      : log.type === 'in' ? <span className="text-green-400 font-bold text-[10px]">↓</span>
        : <span className="text-blue-400 font-bold text-[10px]">ℹ</span>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.015, 0.12) }}
      className="group border-b border-[#191919] last:border-0"
    >
      <div
        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#181818] transition-colors select-none"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="w-5 h-5 rounded border border-[#282828] bg-[#161616] flex items-center justify-center shrink-0">
          {dirIcon}
        </div>

        <span className="flex-1 text-[11px] font-mono text-text-secondary truncate">{log.msg}</span>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={copy} title="Copy" className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#2A2A2A] transition-colors">
            {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} className="text-text-muted" />}
          </button>
          <button title="Save" className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#2A2A2A] transition-colors">
            <Download size={11} className="text-text-muted" />
          </button>
          <button title="Info" className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#2A2A2A] transition-colors">
            <Info size={11} className="text-text-muted" />
          </button>
        </div>

        <span className="text-[9px] text-text-muted font-mono bg-[#1E1E1E] border border-[#282828] rounded px-1.5 py-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {size}
        </span>

        <span className="text-[10px] text-text-muted font-mono shrink-0">{log.time}</span>

        <ChevronRight
          size={12}
          className={`text-text-muted transition-transform shrink-0 ${expanded ? 'rotate-90' : ''}`}
        />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1">
              <pre className="text-[11px] font-mono text-text-primary bg-[#0D0D0D] border border-[#222] rounded-md p-3 overflow-auto max-h-48 leading-relaxed custom-scrollbar">
                {pretty}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
