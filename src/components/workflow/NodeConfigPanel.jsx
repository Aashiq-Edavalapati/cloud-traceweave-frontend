'use client';
import React, { useMemo, useState, useCallback } from 'react';
import {
  Settings2, GitBranch, Globe, X, FileJson, Clock, FlaskConical, Terminal,
  Flag, Trash2, Eye, EyeOff, Copy, CheckCircle2, Info, ChevronDown,
  ChevronRight, Play, Lightbulb, ArrowRight, Hash, Braces, BookOpen,
  AlertTriangle, Zap, Folder
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

// ─── Node type metadata ────────────────────────────────────────────────────────
const NODE_META = {
  startNode: {
    icon: Play, color: 'emerald', label: 'Start',
    guide: 'This is the entry point of your workflow. Every workflow must begin here. Nothing to configure — just connect it to your first action node.',
    tips: [],
  },
  endNode: {
    icon: Flag, color: 'red', label: 'End',
    guide: 'Marks the terminal point of your workflow. When execution reaches this node, the workflow completes.',
    tips: [],
  },
  requestNode: {
    icon: Globe, color: 'blue', label: 'HTTP Request',
    guide: 'Executes an HTTP request from your saved collection. The response is automatically stored in the execution context so subsequent nodes can reference it.',
    tips: [
      'Response is stored as responses[\'<nodeId>\'].body, .status, .headers',
      'Use {{variableName}} in your request to inject context variables',
      'Auth, headers, and params from your saved request are automatically applied',
    ],
  },
  conditionNode: {
    icon: GitBranch, color: 'purple', label: 'Condition',
    guide: 'Evaluates a JEXL expression and routes to the TRUE or FALSE output handle. Use this to branch your workflow based on response data.',
    tips: [
      'TRUE handle: top-right (green dot)',
      'FALSE handle: bottom-right (red dot)',
      'Access responses: responses[\'nodeId\'].status',
      'Access variables: variables.myKey',
    ],
    examples: [
      { label: 'Check status 200', expr: "responses['node_abc'].status == 200" },
      { label: 'Check body field', expr: "responses['node_abc'].body.success == true" },
      { label: 'Compare variable',  expr: "variables.retryCount < 3" },
    ],
  },
  transformNode: {
    icon: FileJson, color: 'blue', label: 'Transform',
    guide: 'Extracts a value from the execution context and saves it to a named variable. Use this to pass data between nodes.',
    tips: [
      'Target variable: use variables.myKey format',
      'JEXL expression: evaluate any context expression',
      'Variables persist for the rest of the workflow',
    ],
    examples: [
      { label: 'Save auth token', variable: 'variables.token', expr: "responses['node_abc'].body.access_token" },
      { label: 'Save user ID',    variable: 'variables.userId', expr: "responses['node_abc'].body.data.id" },
      { label: 'Increment count', variable: 'variables.count',  expr: "(variables.count || 0) + 1" },
    ],
  },
  testNode: {
    icon: FlaskConical, color: 'pink', label: 'Test Assertion',
    guide: 'Asserts that a condition is true. If it passes, execution flows to the PASS handle; if it fails, it flows to the FAIL handle. Use for automated testing of your API flows.',
    tips: [
      'PASS handle: top-right (green dot)',
      'FAIL handle: bottom-right (red dot)',
      'Failed assertions are logged to the terminal',
      'Chain multiple test nodes to build a full test suite',
    ],
    examples: [
      { label: 'Assert status 200', expr: "responses['node_abc'].status == 200" },
      { label: 'Assert body exists', expr: "responses['node_abc'].body != null" },
      { label: 'Assert field value',  expr: "responses['node_abc'].body.id > 0" },
    ],
  },
  scriptNode: {
    icon: Terminal, color: 'cyan', label: 'Script',
    guide: 'Runs arbitrary JavaScript in a sandboxed VM. Modify context.variables to store data. You can also log messages to the terminal.',
    tips: [
      'Access responses: responses[\'nodeId\']',
      'Modify variables: variables.myKey = value',
      'Log to terminal: console.log("message")',
      'Script timeout: 1 second max',
    ],
    examples: [
      { label: 'Extract & save', code: "variables.name = responses['node_abc'].body.name;" },
      { label: 'Computed value',  code: "variables.total = (variables.price || 0) * (variables.qty || 1);" },
      { label: 'Log data',        code: "console.log('Status:', responses['node_abc'].status);" },
    ],
  },
  delayNode: {
    icon: Clock, color: 'amber', label: 'Delay',
    guide: 'Pauses workflow execution for the specified duration. Useful for rate limiting, polling intervals, or waiting for async operations.',
    tips: [
      'Enter delay in milliseconds (1000ms = 1 second)',
      'Max recommended: 30000ms (30s)',
    ],
  },
};

const COLOR_MAP = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10',  border: 'border-emerald-500/20', ring: 'ring-emerald-500/30' },
  red:     { text: 'text-red-400',     bg: 'bg-red-500/10',      border: 'border-red-500/20',     ring: 'ring-red-500/30' },
  blue:    { text: 'text-blue-400',    bg: 'bg-blue-500/10',     border: 'border-blue-500/20',    ring: 'ring-blue-500/30' },
  purple:  { text: 'text-purple-400',  bg: 'bg-purple-500/10',   border: 'border-purple-500/20',  ring: 'ring-purple-500/30' },
  pink:    { text: 'text-pink-400',    bg: 'bg-pink-500/10',     border: 'border-pink-500/20',    ring: 'ring-pink-500/30' },
  cyan:    { text: 'text-cyan-400',    bg: 'bg-cyan-500/10',     border: 'border-cyan-500/20',    ring: 'ring-cyan-500/30' },
  amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/10',    border: 'border-amber-500/20',   ring: 'ring-amber-500/30' },
};

// ─── Sub-components ─────────────────────────────────────────────────────────────

const CopyButton = ({ text, size = 12 }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="p-1 rounded hover:bg-white/10 transition-colors shrink-0">
      {copied ? <CheckCircle2 size={size} className="text-emerald-400" /> : <Copy size={size} className="text-white/30 hover:text-white/60" />}
    </button>
  );
};

const Label = ({ children }) => (
  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">{children}</label>
);

const CodeInput = ({ value, onChange, placeholder, color = 'text-purple-300', rows = 3, monoHint }) => (
  <div className="relative">
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full bg-[#080808] border border-white/8 hover:border-white/15 focus:border-white/25 rounded-xl px-3 py-2.5 text-[12px] font-mono ${color} placeholder-white/20 focus:outline-none resize-none transition-colors leading-relaxed custom-scrollbar`}
    />
    {monoHint && (
      <span className="absolute right-2.5 top-2 text-[9px] font-mono text-white/15 select-none">{monoHint}</span>
    )}
  </div>
);

const TextInput = ({ value, onChange, placeholder, color = 'text-white' }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full bg-[#080808] border border-white/8 hover:border-white/15 focus:border-white/25 rounded-xl px-3 py-2 text-sm font-mono ${color} placeholder-white/20 focus:outline-none transition-colors`}
  />
);

const NumberInput = ({ value, onChange, color = 'text-white', step = 100, min = 0 }) => (
  <input
    type="number"
    value={value}
    step={step}
    min={min}
    onChange={e => onChange(parseInt(e.target.value, 10))}
    className={`w-full bg-[#080808] border border-white/8 hover:border-white/15 focus:border-white/25 rounded-xl px-3 py-2 text-sm font-mono ${color} focus:outline-none transition-colors`}
  />
);

// Guide section shown at top of every config panel
const NodeGuide = ({ meta, colors }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden mb-4`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
      >
        <Lightbulb size={13} className={colors.text} />
        <span className="text-xs font-semibold text-white/70 flex-1">How to use {meta.label}</span>
        {open ? <ChevronDown size={13} className="text-white/30" /> : <ChevronRight size={13} className="text-white/30" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-white/5">
          <p className="text-[11px] text-white/50 leading-relaxed pt-2">{meta.guide}</p>
          {meta.tips?.length > 0 && (
            <ul className="space-y-1">
              {meta.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-white/40">
                  <span className={`${colors.text} mt-0.5 shrink-0`}>›</span>
                  <span className="font-mono">{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// Expression examples
const ExamplesPanel = ({ examples, onUse, type = 'expr' }) => {
  if (!examples?.length) return null;
  return (
    <div className="space-y-1.5">
      <Label>Examples — click to use</Label>
      {examples.map((ex, i) => (
        <button
          key={i}
          onClick={() => onUse(ex)}
          className="w-full text-left group flex items-start gap-2 bg-[#080808] border border-white/5 hover:border-white/15 rounded-lg px-2.5 py-2 transition-all"
        >
          <Zap size={10} className="text-white/20 group-hover:text-amber-400 shrink-0 mt-0.5 transition-colors" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-white/40 group-hover:text-white/60 mb-0.5">{ex.label}</p>
            <p className="text-[10px] font-mono text-white/30 group-hover:text-white/50 truncate">
              {type === 'transform' ? `${ex.variable} = ${ex.expr}` : ex.expr || ex.code}
            </p>
          </div>
          <ArrowRight size={10} className="text-white/10 group-hover:text-white/40 shrink-0 mt-0.5 transition-colors" />
        </button>
      ))}
    </div>
  );
};

// Context variable reference panel
const ContextReference = ({ nodes }) => {
  const [copied, setCopied] = useState('');
  const requestNodes = nodes.filter(n => n.type === 'requestNode' && n.data?.requestId);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 1500);
  };

  const refItem = (text, label, color) => (
    <div
      key={text}
      onClick={() => copy(text)}
      className="group flex items-center justify-between font-mono text-[11px] bg-[#080808] border border-white/5 hover:border-white/15 rounded-lg px-2.5 py-1.5 cursor-pointer transition-all"
    >
      <span className={color}>{text}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-white/20">{label}</span>
        {copied === text
          ? <CheckCircle2 size={11} className="text-emerald-400" />
          : <Copy size={11} className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>
    </div>
  );

  return (
    <div className="mt-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Context Reference</span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      {/* Stored variables */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Hash size={11} className="text-purple-400" />
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Variables</span>
        </div>
        {refItem("variables.myKey", "stored var", "text-purple-300")}
      </div>

      {/* Node responses */}
      {requestNodes.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Braces size={11} className="text-blue-400" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Node Responses</span>
          </div>
          <div className="space-y-1">
            {requestNodes.map((n, i) => {
              const id = n.id;
              const name = n.data?.requestConfig?.name || n.data?.url || `Request ${i + 1}`;
              return (
                <div key={id} className="space-y-1">
                  <p className="text-[9px] text-white/20 px-1 truncate">Step {i+1}: {name}</p>
                  {refItem(`responses['${id}'].status`, "HTTP status", "text-blue-300")}
                  {refItem(`responses['${id}'].body`, "response body", "text-blue-300")}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {requestNodes.length === 0 && (
        <p className="text-[10px] text-white/20 italic px-1">Add Request nodes to the canvas to see response references here.</p>
      )}
    </div>
  );
};

// ─── Method badge ────────────────────────────────────────────────────────────
const METHOD_COLORS = {
  GET:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  POST:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
  PUT:    'text-amber-400 bg-amber-500/10 border-amber-500/20',
  PATCH:  'text-orange-400 bg-orange-500/10 border-orange-500/20',
  DELETE: 'text-red-400 bg-red-500/10 border-red-500/20',
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function NodeConfigPanel({ selectedNode, nodes, deleteNode, updateNodeData, onClose }) {
  const { requestStates, collections, activeWorkspaceId } = useAppStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [previewReqId, setPreviewReqId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [expandedCollections, setExpandedCollections] = useState(new Set());

  // 1. Group requests by their collections (handling nested folders)
  const groupedCollections = useMemo(() => {
    const colMap = new Map();

    const processCollection = (col, parentName = '') => {
      if (col.workspaceId === activeWorkspaceId) {
        // Create a breadcrumb-style name if nested (e.g., "Auth / Login")
        const fullName = parentName ? `${parentName} / ${col.name}` : col.name;
        colMap.set(col.id, {
          id: col.id,
          name: fullName,
          requests: []
        });
        if (col.children?.length) {
          col.children.forEach(child => processCollection(child, fullName));
        }
      }
    };

    (collections || []).forEach(c => processCollection(c));

    // Push requests into their respective mapped collections
    Object.values(requestStates || {}).forEach(req => {
      if (colMap.has(req.collectionId)) {
        colMap.get(req.collectionId).requests.push(req);
      }
    });

    // Convert map to array, filter out empty collections, and sort alphabetically
    return Array.from(colMap.values())
      .filter(col => col.requests.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [requestStates, collections, activeWorkspaceId]);

  // 2. Filter the grouped data based on the search input
  const filteredCollections = useMemo(() => {
    if (!dropdownSearch.trim()) return groupedCollections;
    
    const search = dropdownSearch.toLowerCase();

    return groupedCollections.map(col => {
      const matchesColName = col.name.toLowerCase().includes(search);
      const matchingReqs = col.requests.filter(r => r.name.toLowerCase().includes(search));

      // Keep collection if the folder name matches OR if it contains matching requests
      if (matchesColName || matchingReqs.length > 0) {
        return {
          ...col,
          // If folder name matches, show all requests inside it. Otherwise, show only matched requests.
          requests: matchesColName && matchingReqs.length === 0 ? col.requests : matchingReqs
        };
      }
      return null;
    }).filter(Boolean);
  }, [groupedCollections, dropdownSearch]);

  if (!selectedNode) return null;

  const { id, type, data } = selectedNode;
  const meta   = NODE_META[type] || {};
  const colors = COLOR_MAP[meta.color || 'blue'];
  const Icon   = meta.icon || Settings2;

  const set = (key, val) => updateNodeData(id, { [key]: val });

  const handleDelete = () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    deleteNode(id);
    onClose();
  };

  const showContextRef = ['conditionNode', 'transformNode', 'testNode', 'scriptNode'].includes(type);

  return (
    <div className="w-[340px] h-full bg-[#0c0c0c] border-l border-white/6 flex flex-col shadow-2xl z-20 absolute right-0 top-0 animate-in slide-in-from-right-8 duration-200">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/6 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0`}>
            <Icon size={14} className={colors.text} />
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${colors.text} leading-none`}>{type.replace('Node', '')}</p>
            <p className="text-sm font-bold text-white leading-none mt-0.5">{meta.label} Settings</p>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 text-white/30 hover:text-white transition-colors">
          <X size={15} />
        </button>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
        {/* Guide */}
        {meta.guide && <NodeGuide meta={meta} colors={colors} />}

        {/* ── requestNode ── */}
        {type === 'requestNode' && (
          <div className="space-y-4">
            <div>
              <Label>Select Request</Label>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-[#080808] border border-white/8 hover:border-white/20 rounded-xl px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors"
              >
                {data.requestId && requestStates[data.requestId] ? (
                  <div className="flex items-center gap-2 truncate">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${METHOD_COLORS[(requestStates[data.requestId]?.config?.method || 'GET').toUpperCase()] || ''}`}>
                      {requestStates[data.requestId]?.config?.method || 'GET'}
                    </span>
                    <span className="truncate text-white/80 text-xs font-medium">{requestStates[data.requestId].name}</span>
                  </div>
                ) : (
                  <span className="text-white/25 text-xs italic">— Choose a saved request —</span>
                )}
                <ChevronDown size={14} className={`text-white/30 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isDropdownOpen && (
                <div className="relative mt-1.5 bg-[#0e0e0e] border border-white/10 rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2.5 border-b border-white/5 bg-black/30">
                    <input
                      type="text"
                      placeholder="Search requests…"
                      value={dropdownSearch}
                      onChange={e => setDropdownSearch(e.target.value)}
                      className="w-full bg-transparent text-xs text-white placeholder-white/25 focus:outline-none px-1"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar py-1">
                    {filteredCollections.length === 0 ? (
                      <p className="p-4 text-center text-xs text-white/25">No matching requests</p>
                    ) : (
                      filteredCollections.map(col => {
                        // Auto-expand if the user is actively searching, otherwise respect the toggle state
                        const isExpanded = dropdownSearch.trim() ? true : expandedCollections.has(col.id);

                        return (
                          <div key={col.id} className="border-b border-white/5 last:border-0">
                            {/* Collection Header */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                // Only allow manual toggling if not searching
                                if (!dropdownSearch.trim()) {
                                  setExpandedCollections(prev => {
                                    const next = new Set(prev);
                                    if (next.has(col.id)) next.delete(col.id);
                                    else next.add(col.id);
                                    return next;
                                  });
                                }
                              }}
                              className="flex items-center gap-2 px-3 py-2 cursor-pointer bg-[#0a0a0a] hover:bg-white/5 transition-colors group select-none"
                            >
                              <Folder size={12} className={`${isExpanded ? 'text-amber-400' : 'text-white/30'} group-hover:text-amber-400 transition-colors shrink-0`} />
                              <span className="text-[11px] font-bold text-white/60 group-hover:text-white/80 truncate flex-1">
                                {col.name}
                              </span>
                              <span className="text-[9px] font-mono text-white/20 bg-white/5 px-1.5 py-0.5 rounded">
                                {col.requests.length}
                              </span>
                              <ChevronDown size={12} className={`text-white/20 transition-transform ${isExpanded ? 'rotate-180' : '-rotate-90'}`} />
                            </div>

                            {/* Requests List */}
                            {isExpanded && (
                              <div className="bg-black/40 pb-1 pt-0.5">
                                {col.requests.map(req => (
                                  <div key={req.id}>
                                    <div className={`flex items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-white/10 transition-colors ml-2 mr-2 rounded-md mt-0.5 ${data.requestId === req.id ? 'bg-blue-500/10 border border-blue-500/20' : 'border border-transparent'}`}>
                                      <div
                                        className="flex items-center gap-2 flex-1 overflow-hidden"
                                        onClick={() => {
                                          set('requestId', req.id);
                                          set('method', req.config?.method || 'GET');
                                          set('url', req.config?.url || '');
                                          setIsDropdownOpen(false);
                                          setDropdownSearch('');
                                        }}
                                      >
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase shrink-0 ${METHOD_COLORS[(req.config?.method || 'GET').toUpperCase()] || ''}`}>
                                          {req.config?.method || 'GET'}
                                        </span>
                                        <span className="truncate text-[11px] font-medium text-white/80">{req.name}</span>
                                      </div>
                                      <button
                                        onClick={e => { e.stopPropagation(); setPreviewReqId(previewReqId === req.id ? null : req.id); }}
                                        className="p-1 rounded text-white/25 hover:text-white/60 hover:bg-white/10 transition-all shrink-0 ml-2"
                                      >
                                        {previewReqId === req.id ? <EyeOff size={11} /> : <Eye size={11} />}
                                      </button>
                                    </div>
                                    {/* Request Preview */}
                                    {previewReqId === req.id && (
                                      <div className="px-4 py-1.5 ml-2 mr-2 mb-1 bg-black/50 text-[10px] font-mono text-white/30 space-y-1 rounded-b-md border-x border-b border-white/5">
                                        <p className="truncate text-blue-400/60">{req.config?.url || 'No URL'}</p>
                                        {req.config?.body?.type !== 'none' && (
                                          <p><span className="text-white/20">body:</span> {req.config?.body?.type}</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label>Timeout (ms)</Label>
              <NumberInput value={data.timeout || 5000} onChange={v => set('timeout', v)} color="text-amber-400" step={500} min={100} />
              <p className="mt-1.5 text-[10px] text-white/25">Request will fail if it exceeds this duration.</p>
            </div>

            {/* Show the context key for this node */}
            {data.requestId && (
              <div className={`rounded-xl border ${colors.border} ${colors.bg} p-3 space-y-1.5`}>
                <div className="flex items-center gap-1.5">
                  <BookOpen size={11} className={colors.text} />
                  <span className={`text-[10px] font-bold ${colors.text} uppercase tracking-widest`}>Response Reference</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">After this node runs, reference its response using:</p>
                <div className="flex items-center justify-between bg-black/30 rounded-lg px-2.5 py-1.5 font-mono text-[11px]">
                  <span className="text-blue-300">{`responses['${id}'].body`}</span>
                  <CopyButton text={`responses['${id}'].body`} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg px-2.5 py-1.5 font-mono text-[11px]">
                  <span className="text-blue-300">{`responses['${id}'].status`}</span>
                  <CopyButton text={`responses['${id}'].status`} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── conditionNode ── */}
        {type === 'conditionNode' && (
          <div className="space-y-4">
            <div>
              <Label>JEXL Expression</Label>
              <CodeInput
                value={data.expression || ''}
                onChange={v => set('expression', v)}
                placeholder={`responses['node_abc'].status == 200`}
                color="text-purple-300"
                rows={3}
                monoHint="JEXL"
              />
              <p className="mt-1.5 text-[10px] text-white/30 leading-relaxed">
                Returns <span className="text-emerald-400">true</span> → follows TRUE path &nbsp;·&nbsp; Returns <span className="text-red-400">false</span> → follows FALSE path
              </p>
            </div>
            <ExamplesPanel
              examples={meta.examples}
              onUse={ex => set('expression', ex.expr)}
            />
            <ContextReference nodes={nodes} />
          </div>
        )}

        {/* ── transformNode ── */}
        {type === 'transformNode' && (
          <div className="space-y-4">
            <div>
              <Label>Target Variable</Label>
              <TextInput
                value={data.variable || ''}
                onChange={v => set('variable', v)}
                placeholder="variables.token"
                color="text-purple-300"
              />
              <p className="mt-1.5 text-[10px] text-white/30">The variable name to write the result into.</p>
            </div>
            <div>
              <Label>Value Expression (JEXL)</Label>
              <CodeInput
                value={data.expression || ''}
                onChange={v => set('expression', v)}
                placeholder={`responses['node_abc'].body.access_token`}
                color="text-blue-300"
                rows={3}
                monoHint="JEXL"
              />
            </div>
            <ExamplesPanel
              type="transform"
              examples={meta.examples}
              onUse={ex => { set('variable', ex.variable); set('expression', ex.expr); }}
            />
            <ContextReference nodes={nodes} />
          </div>
        )}

        {/* ── testNode ── */}
        {type === 'testNode' && (
          <div className="space-y-4">
            <div>
              <Label>Assertion Expression (JEXL)</Label>
              <CodeInput
                value={data.assertion || ''}
                onChange={v => set('assertion', v)}
                placeholder={`responses['node_abc'].status == 200`}
                color="text-pink-300"
                rows={3}
                monoHint="JEXL"
              />
              <p className="mt-1.5 text-[10px] text-white/30 leading-relaxed">
                Must evaluate to <span className="text-emerald-400">true</span> for the test to pass.
              </p>
            </div>
            <ExamplesPanel
              examples={meta.examples}
              onUse={ex => set('assertion', ex.expr)}
            />
            <ContextReference nodes={nodes} />
          </div>
        )}

        {/* ── scriptNode ── */}
        {type === 'scriptNode' && (
          <div className="space-y-4">
            <div>
              <Label>JavaScript Code</Label>
              <CodeInput
                value={data.script || ''}
                onChange={v => set('script', v)}
                placeholder={"// Modify variables or log output\nvariables.result = responses['node_abc'].body.data;"}
                color="text-cyan-300"
                rows={8}
                monoHint="JS"
              />
            </div>
            <div className={`rounded-xl border ${colors.border} ${colors.bg} p-3 space-y-2`}>
              <div className="flex items-center gap-1.5">
                <BookOpen size={11} className={colors.text} />
                <span className={`text-[10px] font-bold ${colors.text} uppercase tracking-widest`}>Available Globals</span>
              </div>
              {[
                ['responses', 'object', 'All node responses keyed by node ID'],
                ['variables', 'object', 'Read & write persistent variables'],
                ['console.log()', 'fn', 'Output to terminal logs'],
              ].map(([name, type, desc]) => (
                <div key={name} className="flex items-start gap-2 text-[11px]">
                  <code className="text-cyan-300 shrink-0">{name}</code>
                  <span className="text-white/20 shrink-0 text-[9px] mt-0.5 border border-white/10 px-1 rounded">{type}</span>
                  <span className="text-white/30">{desc}</span>
                </div>
              ))}
            </div>
            <ExamplesPanel
              examples={meta.examples}
              onUse={ex => set('script', (data.script ? data.script + '\n' : '') + ex.code)}
            />
            <ContextReference nodes={nodes} />
          </div>
        )}

        {/* ── delayNode ── */}
        {type === 'delayNode' && (
          <div className="space-y-4">
            <div>
              <Label>Delay Duration (ms)</Label>
              <NumberInput value={data.delay || 1000} onChange={v => set('delay', v)} color="text-amber-400" step={250} min={0} />
              <p className="mt-1.5 text-[10px] text-white/30">
                {data.delay >= 1000 ? `= ${(data.delay / 1000).toFixed(1)} seconds` : `= ${data.delay}ms`}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[500, 1000, 2000, 5000].map(ms => (
                <button
                  key={ms}
                  onClick={() => set('delay', ms)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${data.delay === ms ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-white/3 border-white/8 text-white/30 hover:border-white/20'}`}
                >
                  {ms >= 1000 ? `${ms/1000}s` : `${ms}ms`}
                </button>
              ))}
            </div>
          </div>
        )}

        {(type === 'startNode' || type === 'endNode') && (
          <div className={`rounded-xl border ${colors.border} ${colors.bg} p-3`}>
            <p className="text-[11px] text-white/40 leading-relaxed">{meta.guide}</p>
          </div>
        )}
      </div>

      {/* ── Footer: Delete ── */}
      {type !== 'startNode' && (
        <div className="p-4 border-t border-white/6 shrink-0">
          <button
            onClick={handleDelete}
            onBlur={() => setDeleteConfirm(false)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              deleteConfirm
                ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                : 'bg-red-500/8 text-red-400/70 border border-red-500/15 hover:bg-red-500/15 hover:text-red-400'
            }`}
          >
            <Trash2 size={14} />
            {deleteConfirm ? 'Confirm Delete' : 'Delete Node'}
          </button>
        </div>
      )}
    </div>
  );
}