import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, CornerDownLeft } from 'lucide-react';
import Editor from '@monaco-editor/react';

const MESSAGE_FORMATS = ['JSON', 'Text', 'Binary'];

const MONACO_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 12,
  lineHeight: 20,
  fontFamily: "'Space Mono', 'Fira Code', monospace",
  fontLigatures: true,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  lineNumbers: 'on',
  glyphMargin: false,
  folding: true,
  lineDecorationsWidth: 4,
  lineNumbersMinChars: 3,
  renderLineHighlight: 'line',
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  scrollbar: { vertical: 'auto', horizontal: 'hidden' },
  padding: { top: 8, bottom: 8 },
};

const MONACO_THEME_DEF = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'string.key.json', foreground: '7DD3FC' },
    { token: 'string.value.json', foreground: 'A3E635' },
    { token: 'number', foreground: 'FB923C' },
    { token: 'keyword', foreground: 'F472B6' },
  ],
  colors: {
    'editor.background': '#111111',
    'editor.lineHighlightBackground': '#1A1A1A',
    'editorLineNumber.foreground': '#444444',
    'editorLineNumber.activeForeground': '#888888',
    'editor.selectionBackground': 'var(--brand-primary)30',
    'editorCursor.foreground': 'var(--brand-primary)',
  },
};

export default function WsComposer({ wsState }) {
  const { isConnected, sendMessage } = wsState;
  const [message, setMessage] = useState('{\n  \n}');
  const [msgFormat, setMsgFormat] = useState('JSON');
  const [sendOnEnter, setSendOnEnter] = useState(false);

  const sendMsgRef = useRef(null);

  const handleSend = useCallback(() => {
    sendMessage(message);
  }, [message, sendMessage]);

  useEffect(() => {
    sendMsgRef.current = handleSend;
  }, [handleSend]);

  const handleTextKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
      return;
    }
    if (sendOnEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend, sendOnEnter]);

  const handleEditorMount = useCallback((editor, monaco) => {
    monaco.editor.defineTheme('ws-dark', MONACO_THEME_DEF);
    monaco.editor.setTheme('ws-dark');
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => sendMsgRef.current?.(),
    );
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-3 pt-2 pb-1.5 border-b border-border-subtle bg-bg-panel shrink-0">
        {MESSAGE_FORMATS.map(fmt => (
          <button
            key={fmt}
            onClick={() => setMsgFormat(fmt)}
            className={`px-3 py-1 text-[11px] rounded transition-colors ${msgFormat === fmt ? 'bg-bg-input text-text-primary border border-border-strong' : 'text-text-muted hover:text-text-secondary'}`}
          >
            {fmt}
          </button>
        ))}
        {msgFormat !== 'JSON' && (
          <button
            onClick={() => setSendOnEnter(v => !v)}
            className={`ml-1 flex items-center gap-1 px-2 py-1 text-[10px] rounded border transition-colors ${sendOnEnter ? 'border-brand-primary/50 text-brand-primary bg-brand-primary/10' : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border-subtle'}`}
          >
            <CornerDownLeft size={10} /> Send on Enter
          </button>
        )}
        <span className="ml-auto text-[10px] text-text-muted select-none">⌘ + Enter to send</span>
      </div>

      <div className="flex-1 relative min-h-0">
        {msgFormat === 'JSON' ? (
          <Editor height="100%" defaultLanguage="json" value={message} onChange={val => setMessage(val || '')} onMount={handleEditorMount} options={MONACO_OPTIONS} theme="ws-dark" />
        ) : (
          <textarea value={message} onChange={e => setMessage(e.target.value)} onKeyDown={handleTextKeyDown} className="w-full h-full bg-[#111] px-4 py-3 text-xs font-mono text-text-primary focus:outline-none resize-none placeholder-text-secondary/30" placeholder="Message to send…" />
        )}

        <motion.button
          onClick={handleSend}
          disabled={!isConnected}
          whileTap={{ scale: 0.93 }}
          className="absolute bottom-3 right-3 bg-brand-primary text-brand-surface px-3 py-1.5 rounded flex items-center gap-1.5 text-[11px] font-black hover:bg-brand-glow disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-glow-sm"
        >
          <Send size={12} /> Send
        </motion.button>
      </div>
    </div>
  );
}
