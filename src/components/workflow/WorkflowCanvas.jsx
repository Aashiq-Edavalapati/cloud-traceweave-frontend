'use client';
import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow, MiniMap, Controls, Background,
  useNodesState, useEdgesState, addEdge,
  ReactFlowProvider, useReactFlow, BackgroundVariant, Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Save, Play, Square, Terminal, X, AlignLeft, Variable, ListTree,
  Trash2, ChevronUp, ChevronDown, Search, Copy, CheckCircle2,
  Clock, AlertCircle, Info, Filter, RotateCcw, Zap, Activity,
  ChevronRight, Hash, Braces
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { api, WS_URL } from '@/lib/api';
import { nanoid } from 'nanoid';

import StartNode from './nodes/StartNode';
import RequestNode from './nodes/RequestNode';
import ConditionNode from './nodes/ConditionNode';
import TransformNode from './nodes/TransformNode';
import DelayNode from './nodes/DelayNode';
import TestNode from './nodes/TestNode';
import ScriptNode from './nodes/ScriptNode';
import EndNode from './nodes/EndNode';
import NodeLibrary from './NodeLibrary';
import NodeConfigPanel from './NodeConfigPanel';

const nodeTypes = {
  startNode: StartNode, requestNode: RequestNode,
  conditionNode: ConditionNode, transformNode: TransformNode,
  delayNode: DelayNode, testNode: TestNode,
  scriptNode: ScriptNode, endNode: EndNode,
};

const initialNodes = [
  { id: 'start-1', type: 'startNode', position: { x: 100, y: 200 }, data: {} },
];

const getId = () => `node_${nanoid(8).replace(/[^a-zA-Z0-9]/g, '')}`;

// ─── Log level classification ────────────────────────────────────────────────
const classifyLog = (log) => {
  const l = log.toLowerCase();
  if (l.startsWith('error') || l.includes('failed') || l.includes('✗')) return 'error';
  if (l.includes('warn') || l.includes('⚠')) return 'warn';
  if (l.includes('success') || l.includes('✓') || l.includes('complete')) return 'success';
  if (l.includes('start') || l.includes('running') || l.includes('→')) return 'info';
  return 'default';
};

const LOG_STYLES = {
  error:   { dot: 'bg-red-500',     text: 'text-red-400',     prefix: '✗', bg: 'bg-red-500/5 border-red-500/10' },
  warn:    { dot: 'bg-amber-400',   text: 'text-amber-400',   prefix: '⚠', bg: 'bg-amber-500/5 border-amber-500/10' },
  success: { dot: 'bg-emerald-500', text: 'text-emerald-400', prefix: '✓', bg: 'bg-emerald-500/5 border-emerald-500/10' },
  info:    { dot: 'bg-blue-400',    text: 'text-blue-400',    prefix: '→', bg: 'bg-blue-500/5 border-blue-500/10' },
  default: { dot: 'bg-white/20',    text: 'text-white/50',    prefix: '·', bg: '' },
};

// ─── JSON Tree Viewer ────────────────────────────────────────────────────────
const JsonValue = ({ value, depth = 0 }) => {
  const [open, setOpen] = useState(depth < 2);
  const [copied, setCopied] = useState(false);

  const copyVal = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  if (value === null) return <span className="text-white/30 italic">null</span>;
  if (value === undefined) return <span className="text-white/20 italic">undefined</span>;
  if (typeof value === 'boolean') return <span className={value ? 'text-emerald-400' : 'text-red-400'}>{String(value)}</span>;
  if (typeof value === 'number') return <span className="text-amber-300">{value}</span>;
  if (typeof value === 'string') {
    return value.length > 80
      ? <span className="text-emerald-300/80 break-all">"{value}"</span>
      : <span className="text-emerald-300/80">"{value}"</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-white/30">[]</span>;
    return (
      <span>
        <button onClick={() => setOpen(!open)} className="text-white/50 hover:text-white/80 font-mono text-[10px] transition-colors">
          {open ? '▾' : '▸'} <span className="text-white/30">[{value.length}]</span>
        </button>
        {open && (
          <div className="pl-4 border-l border-white/5 mt-0.5 space-y-0.5">
            {value.slice(0, 50).map((item, i) => (
              <div key={i} className="flex gap-1.5 text-[11px] font-mono">
                <span className="text-white/20 select-none w-4 text-right shrink-0">{i}</span>
                <JsonValue value={item} depth={depth + 1} />
              </div>
            ))}
            {value.length > 50 && <span className="text-white/20 text-[10px] pl-4">… {value.length - 50} more items</span>}
          </div>
        )}
      </span>
    );
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return <span className="text-white/30">{'{}'}</span>;
    return (
      <span>
        <button onClick={() => setOpen(!open)} className="text-white/50 hover:text-white/80 font-mono text-[10px] transition-colors">
          {open ? '▾' : '▸'} <span className="text-white/30">{'{'}…{'}'} {keys.length}k</span>
        </button>
        {open && (
          <div className="pl-4 border-l border-white/5 mt-0.5 space-y-0.5">
            {keys.slice(0, 100).map(k => (
              <div key={k} className="flex gap-1.5 text-[11px] font-mono flex-wrap">
                <span className="text-blue-300/70 shrink-0">{k}:</span>
                <JsonValue value={value[k]} depth={depth + 1} />
              </div>
            ))}
            {keys.length > 100 && <span className="text-white/20 text-[10px]">… {keys.length - 100} more keys</span>}
          </div>
        )}
      </span>
    );
  }

  return <span className="text-white/40">{String(value)}</span>;
};

const JsonTreePanel = ({ data, emptyMsg, accentColor = 'blue' }) => {
  const [search, setSearch] = useState('');
  const keys = Object.keys(data || {});

  const filtered = search
    ? keys.filter(k => k.toLowerCase().includes(search.toLowerCase()))
    : keys;

  if (keys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 text-white/20">
        <Braces size={20} />
        <span className="text-xs font-mono italic">{emptyMsg}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {keys.length > 2 && (
        <div className="sticky top-0 bg-[#0c0c0c]/90 backdrop-blur-sm pb-2 z-10">
          <div className="flex items-center gap-2 bg-white/3 border border-white/8 rounded-lg px-2.5 py-1.5">
            <Search size={11} className="text-white/25" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter keys…"
              className="bg-transparent text-xs text-white/60 placeholder-white/20 focus:outline-none flex-1"
            />
          </div>
        </div>
      )}
      {filtered.map(key => (
        <div key={key} className="bg-[#080808] border border-white/5 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/2">
            <div className="flex items-center gap-2">
              <Hash size={11} className={`text-${accentColor}-400/60`} />
              <span className={`text-xs font-bold font-mono text-${accentColor}-300/80 truncate`}>{key}</span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(data[key], null, 2))}
              className="p-1 rounded hover:bg-white/8 text-white/20 hover:text-white/50 transition-colors"
            >
              <Copy size={10} />
            </button>
          </div>
          <div className="px-3 py-2 text-[11px] font-mono overflow-x-auto">
            <JsonValue value={data[key]} depth={0} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Log entry component ─────────────────────────────────────────────────────
const LogEntry = ({ log, index, timestamp }) => {
  const level = classifyLog(log);
  const style = LOG_STYLES[level];

  return (
    <div className={`flex items-start gap-3 py-1.5 px-2 rounded-lg border ${style.bg || 'border-transparent'} group`}>
      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
        <span className="text-white/15 font-mono text-[9px] w-5 text-right select-none">{String(index + 1).padStart(2, '0')}</span>
        <div className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
      </div>
      <span className={`flex-1 ${style.text} font-mono text-[11px] leading-relaxed break-words`}>{log}</span>
      {timestamp && (
        <span className="text-[9px] text-white/15 font-mono shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{timestamp}</span>
      )}
    </div>
  );
};

// ─── Execution Timeline ──────────────────────────────────────────────────────
const ExecutionTimeline = ({ logs }) => {
  if (!logs || logs.length === 0) return null;

  // Parse out node events from logs
  const nodeEvents = logs
    .filter(l => l.includes('→') || l.includes('✓') || l.includes('✗'))
    .slice(0, 10);

  if (nodeEvents.length === 0) return null;

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 overflow-x-auto">
      {nodeEvents.map((event, i) => {
        const isError = event.includes('✗') || event.includes('failed');
        const isSuccess = event.includes('✓') || event.includes('complete');
        return (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-1 shrink-0 text-[9px] font-mono px-2 py-1 rounded-md border
              ${isError   ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                isSuccess ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                'bg-white/3 border-white/8 text-white/40'}`}
            >
              {isError ? '✗' : isSuccess ? '✓' : '→'}
              <span className="truncate max-w-[80px]">{event.replace(/[→✓✗]/g, '').trim().split(':')[0].trim()}</span>
            </div>
            {i < nodeEvents.length - 1 && <div className="w-3 h-px bg-white/10 shrink-0" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Context Menu ─────────────────────────────────────────────────────────────
const ContextMenu = ({ id, top, left, type, onClose, onDelete }) => (
  <div
    style={{ top, left, position: 'fixed' }}
    className="z-[100] min-w-[160px] bg-[#111] border border-white/10 rounded-xl shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-100"
    onClick={e => e.stopPropagation()}
  >
    <div className="px-3 py-1.5 text-[9px] font-bold text-white/25 uppercase tracking-widest border-b border-white/5 mb-1">
      {type === 'node' ? 'Node' : 'Edge'}
    </div>
    <button
      onClick={() => { onDelete(id, type); onClose(); }}
      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
    >
      <Trash2 size={12} /> Delete {type === 'node' ? 'Node' : 'Edge'}
    </button>
  </div>
);

// ─── Main Canvas ──────────────────────────────────────────────────────────────
function CanvasEditor({ initialData, onSave }) {
  const reactFlowWrapper = useRef(null);
  const logEndRef = useRef(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialData?.nodes?.length > 0 ? initialData.nodes : initialNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialData?.edges?.length > 0 ? initialData.edges : []
  );
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const { activeWorkflow } = useAppStore();
  const [clientId] = useState(() => Math.random().toString(36).substring(7));
  const [isRunning, setIsRunning] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Terminal state
  const [results, setResults] = useState({ logs: [], responses: {}, variables: {} });
  const [logTimestamps, setLogTimestamps] = useState([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalTab, setTerminalTab] = useState('logs');
  const [terminalHeight, setTerminalHeight] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [logFilter, setLogFilter] = useState('all'); // all | error | success | info
  const [logSearch, setLogSearch] = useState('');
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  const [menu, setMenu] = useState(null);
  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();

  const markDirty = useCallback(() => setIsDirty(true), []);

  const handleNodesChange = useCallback((changes) => { onNodesChange(changes); markDirty(); }, [onNodesChange, markDirty]);
  const handleEdgesChange = useCallback((changes) => { onEdgesChange(changes); markDirty(); }, [onEdgesChange, markDirty]);
  const handleNodesDelete = useCallback((deleted) => {
    markDirty();
    if (deleted.some(n => n.id === selectedNodeId)) setSelectedNodeId(null);
  }, [selectedNodeId, markDirty]);

  const deleteElement = useCallback((id, type) => {
    if (type === 'node') {
      setNodes(nds => nds.filter(n => n.id !== id));
      setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
      if (id === selectedNodeId) setSelectedNodeId(null);
    } else {
      setEdges(eds => eds.filter(e => e.id !== id));
    }
    markDirty();
  }, [setNodes, setEdges, selectedNodeId, markDirty]);

  const onConnect = useCallback((params) => {
    setEdges(eds => addEdge({
      ...params,
      animated: true,
      style: { stroke: 'rgba(255,255,255,0.25)', strokeWidth: 1.5 },
    }, eds));
    markDirty();
  }, [setEdges, markDirty]);

  const onNodeContextMenu = useCallback((e, node) => {
    e.preventDefault();
    setMenu({ id: node.id, type: 'node', top: e.clientY, left: e.clientX });
  }, []);
  const onEdgeContextMenu = useCallback((e, edge) => {
    e.preventDefault();
    setMenu({ id: edge.id, type: 'edge', top: e.clientY, left: e.clientX });
  }, []);
  const onPaneClick = useCallback(() => { setMenu(null); setSelectedNodeId(null); }, []);

  const onDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const newNode = { id: getId(), type, position, data: {} };
    setNodes(nds => nds.concat(newNode));
    setSelectedNodeId(newNode.id);
    markDirty();
  }, [screenToFlowPosition, setNodes, markDirty]);

  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
    ));
    if (!('executionStatus' in newData) && !('error' in newData)) markDirty();
  }, [setNodes, markDirty]);

  const handleSave = () => {
    if (onSave) onSave({ nodes: getNodes(), edges: getEdges() });
    setIsDirty(false);
  };

  // Resize terminal
  useEffect(() => {
    const onMove = (e) => {
      if (!isResizing) return;
      const h = window.innerHeight - e.clientY - 32;
      if (h > 120 && h < window.innerHeight * 0.85) setTerminalHeight(h);
    };
    const onUp = () => { setIsResizing(false); document.body.style.userSelect = ''; };
    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [isResizing]);

  // Auto-scroll logs
  useEffect(() => {
    if (isAutoScroll && terminalTab === 'logs' && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results.logs, isAutoScroll, terminalTab]);

  // WebSocket
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/?clientId=${clientId}`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'node-start') {
          updateNodeData(data.nodeId, { executionStatus: 'running', error: null });
          setResults(prev => ({
            ...prev,
            logs: [...prev.logs, `→ Running: ${data.nodeId}`]
          }));
          setLogTimestamps(prev => [...prev, new Date().toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })]);
        } else if (data.type === 'node-complete') {
          updateNodeData(data.nodeId, { executionStatus: 'success' });
          setResults(prev => ({
            ...prev,
            logs: [...prev.logs, `✓ Completed: ${data.nodeId}`]
          }));
          setLogTimestamps(prev => [...prev, new Date().toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })]);
        } else if (data.type === 'node-error') {
          updateNodeData(data.nodeId, { executionStatus: 'failed', error: data.error });
          setResults(prev => ({
            ...prev,
            logs: [...prev.logs, `✗ Error in ${data.nodeId}: ${data.error}`]
          }));
          setLogTimestamps(prev => [...prev, new Date().toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })]);
        } else if (data.type === 'workflow-complete' || data.type === 'workflow-error') {
          setIsRunning(false);
          if (data.context) {
            setResults(prev => ({
              ...data.context,
              logs: [...prev.logs, ...(data.context.logs || []),
                data.type === 'workflow-complete' ? '✓ Workflow completed successfully.' : `✗ Workflow failed.`
              ]
            }));
            setLogTimestamps(prev => [...prev, new Date().toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })]);
          }
        }
      } catch (_) {}
    };
    return () => ws.close();
  }, [clientId, updateNodeData]);

  const handleRun = async () => {
    if (isRunning) {
      setIsRunning(false);
      setNodes(nds => nds.map(n => n.data.executionStatus === 'running'
        ? { ...n, data: { ...n.data, executionStatus: 'idle' } } : n));
      return;
    }
    setIsRunning(true);
    setIsTerminalOpen(true);
    setTerminalTab('logs');
    const startMsg = `→ Execution started at ${new Date().toLocaleTimeString()}`;
    setResults({ logs: [startMsg], responses: {}, variables: {} });
    setLogTimestamps([new Date().toLocaleTimeString('en', { hour12: false })]);
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, executionStatus: 'idle', error: null } })));

    const store = useAppStore.getState();
    const envs = store.workspaceEnvironments[store.activeWorkspaceId] || [];
    const activeEnv = envs[store.selectedEnvIndex];
    const environmentValues = activeEnv
      ? activeEnv.variables.reduce((acc, v) => { if (v.key && v.active !== false) acc[v.key] = v.value; return acc; }, {})
      : {};

    const hydratedNodes = getNodes().map(node => {
      if (node.type === 'requestNode' && node.data.requestId) {
        const fullReq = store.requestStates[node.data.requestId];
        if (fullReq) return { ...node, data: { ...node.data, requestConfig: fullReq.config } };
      }
      return node;
    });

    try {
      await api.post('/workflows/run-canvas', {
        workflowId: activeWorkflow?.id,
        workflow: { nodes: hydratedNodes, edges: getEdges() },
        clientId,
        environmentValues,
      });
    } catch (err) {
      setIsRunning(false);
      setResults(prev => ({ ...prev, logs: [...prev.logs, `✗ Error: ${err.message}`] }));
    }
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return results.logs
      ?.map((log, i) => ({ log, i, ts: logTimestamps[i] }))
      .filter(({ log }) => {
        if (logSearch && !log.toLowerCase().includes(logSearch.toLowerCase())) return false;
        if (logFilter === 'error')   return classifyLog(log) === 'error';
        if (logFilter === 'success') return classifyLog(log) === 'success';
        if (logFilter === 'info')    return ['info', 'default'].includes(classifyLog(log));
        return true;
      }) || [];
  }, [results.logs, logFilter, logSearch, logTimestamps]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const responseCount = Object.keys(results.responses || {}).length;
  const varCount = Object.keys(results.variables || {}).length;
  const errorCount = results.logs?.filter(l => classifyLog(l) === 'error').length || 0;

  const clearLogs = () => {
    setResults({ logs: [], responses: {}, variables: {} });
    setLogTimestamps([]);
  };

  const copyAllLogs = () => {
    navigator.clipboard.writeText(results.logs?.join('\n') || '');
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#080808]">
      {/* Canvas area */}
      <div className="flex-1 w-full relative flex overflow-hidden" ref={reactFlowWrapper}>
        <NodeLibrary />

        <div className="flex-1 h-full relative flex flex-col">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={(e, node) => { setMenu(null); setSelectedNodeId(node.id); }}
            onPaneClick={onPaneClick}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            onNodesDelete={handleNodesDelete}
            onEdgesDelete={markDirty}
            nodeTypes={nodeTypes}
            fitView
            colorMode="dark"
            proOptions={{ hideAttribution: true }}
          >
            {/* Top-right toolbar */}
            <Panel position="top-right" className="m-4 z-40">
              <div className="flex items-center gap-1.5 bg-[#111]/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/8 shadow-2xl">
                <button
                  onClick={handleRun}
                  className={`flex items-center gap-2 font-bold text-sm py-2 px-4 rounded-xl transition-all duration-200 ${
                    isRunning
                      ? 'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25'
                      : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                  }`}
                >
                  {isRunning
                    ? <><Square size={14} className="animate-pulse" /> Stop</>
                    : <><Play size={14} fill="currentColor" /> Run</>}
                </button>
                <div className="w-px h-6 bg-white/8 mx-0.5" />
                <button
                  onClick={handleSave}
                  disabled={!isDirty}
                  className={`flex items-center gap-2 font-bold text-sm py-2 px-4 rounded-xl transition-all duration-200 ${
                    isDirty
                      ? 'bg-white/8 text-white hover:bg-white/15 border border-white/10'
                      : 'text-white/20 cursor-not-allowed'
                  }`}
                >
                  <Save size={14} /> {isDirty ? 'Save' : 'Saved'}
                </button>
              </div>
            </Panel>

            <Controls className="!bg-[#111] !border-white/8 !rounded-2xl !overflow-hidden !shadow-xl mb-8" />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.05)" />
          </ReactFlow>

          {menu && <ContextMenu {...menu} onClose={() => setMenu(null)} onDelete={deleteElement} />}

          {/* ── TERMINAL DRAWER ─────────────────────────────────────────────── */}
          {isTerminalOpen && (
            <div
              style={{ height: `${terminalHeight}px` }}
              className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a]/98 backdrop-blur-xl border-t border-white/8 shadow-[0_-20px_60px_rgba(0,0,0,0.7)] z-40 flex flex-col"
            >
              {/* Resize handle */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize z-50 group flex items-center justify-center -mt-0.5"
                onMouseDown={() => setIsResizing(true)}
              >
                <div className={`w-16 h-1 rounded-full transition-colors ${isResizing ? 'bg-blue-400' : 'bg-white/10 group-hover:bg-white/25'}`} />
              </div>

              {/* Terminal header */}
              <div className="flex items-center justify-between px-4 pt-1.5 border-b border-white/6 shrink-0">
                {/* Left: title + tabs */}
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2 py-2.5">
                    <Activity size={13} className={isRunning ? 'text-emerald-400 animate-pulse' : 'text-white/30'} />
                    <span className="text-xs font-bold text-white/50 font-mono uppercase tracking-widest">Output</span>
                  </div>

                  {/* Tabs */}
                  {[
                    { id: 'logs',      label: 'Logs',       icon: AlignLeft,  badge: errorCount > 0 ? errorCount : null, badgeColor: 'bg-red-500', color: 'text-white' },
                    { id: 'responses', label: 'Responses',  icon: ListTree,   badge: responseCount > 0 ? responseCount : null, badgeColor: 'bg-blue-500', color: 'text-blue-400' },
                    { id: 'variables', label: 'Variables',  icon: Variable,   badge: varCount > 0 ? varCount : null, badgeColor: 'bg-purple-500', color: 'text-purple-400' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setTerminalTab(tab.id)}
                      className={`relative flex items-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
                        terminalTab === tab.id ? tab.color : 'text-white/30 hover:text-white/50'
                      }`}
                    >
                      <tab.icon size={13} />
                      {tab.label}
                      {tab.badge !== null && (
                        <span className={`${tab.badgeColor} text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none`}>
                          {tab.badge}
                        </span>
                      )}
                      {terminalTab === tab.id && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-current" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1">
                  {terminalTab === 'logs' && (
                    <>
                      {/* Filter buttons */}
                      <div className="flex items-center gap-0.5 mr-2">
                        {[
                          { id: 'all',     label: 'All' },
                          { id: 'error',   label: 'Errors' },
                          { id: 'success', label: 'Pass' },
                          { id: 'info',    label: 'Info' },
                        ].map(f => (
                          <button
                            key={f.id}
                            onClick={() => setLogFilter(f.id)}
                            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${
                              logFilter === f.id
                                ? 'bg-white/10 text-white'
                                : 'text-white/25 hover:text-white/50'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                      <button onClick={copyAllLogs} className="p-1.5 rounded-lg hover:bg-white/8 text-white/25 hover:text-white/60 transition-colors" title="Copy all logs">
                        <Copy size={13} />
                      </button>
                      <button onClick={clearLogs} className="p-1.5 rounded-lg hover:bg-white/8 text-white/25 hover:text-white/60 transition-colors" title="Clear logs">
                        <RotateCcw size={13} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setIsTerminalOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-white/8 text-white/25 hover:text-white/60 transition-colors ml-1"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Execution timeline strip */}
              {terminalTab === 'logs' && results.logs?.length > 0 && (
                <ExecutionTimeline logs={results.logs} />
              )}

              {/* Log search bar */}
              {terminalTab === 'logs' && (
                <div className="px-4 py-2 border-b border-white/4 shrink-0">
                  <div className="flex items-center gap-2 bg-white/3 border border-white/6 rounded-lg px-2.5 py-1.5">
                    <Search size={11} className="text-white/20" />
                    <input
                      type="text"
                      value={logSearch}
                      onChange={e => setLogSearch(e.target.value)}
                      placeholder="Search logs…"
                      className="bg-transparent text-[11px] text-white/50 placeholder-white/20 focus:outline-none flex-1 font-mono"
                    />
                    {logSearch && (
                      <button onClick={() => setLogSearch('')} className="text-white/20 hover:text-white/50 transition-colors">
                        <X size={10} />
                      </button>
                    )}
                    <label className="flex items-center gap-1.5 text-[10px] text-white/20 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isAutoScroll}
                        onChange={e => setIsAutoScroll(e.target.checked)}
                        className="w-3 h-3 accent-blue-400"
                      />
                      Auto-scroll
                    </label>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* LOGS TAB */}
                {terminalTab === 'logs' && (
                  <div className="p-4 space-y-0.5">
                    {filteredLogs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-20 gap-2 text-white/20">
                        <AlignLeft size={16} />
                        <span className="text-xs font-mono italic">
                          {logSearch || logFilter !== 'all' ? 'No logs match filter' : 'Run the workflow to see logs here'}
                        </span>
                      </div>
                    ) : (
                      filteredLogs.map(({ log, i, ts }) => (
                        <LogEntry key={i} log={log} index={i} timestamp={ts} />
                      ))
                    )}
                    <div ref={logEndRef} />
                  </div>
                )}

                {/* RESPONSES TAB */}
                {terminalTab === 'responses' && (
                  <div className="p-4">
                    <JsonTreePanel
                      data={results.responses}
                      emptyMsg="No responses yet — run the workflow"
                      accentColor="blue"
                    />
                  </div>
                )}

                {/* VARIABLES TAB */}
                {terminalTab === 'variables' && (
                  <div className="p-4">
                    <JsonTreePanel
                      data={results.variables}
                      emptyMsg="No variables stored — use a Transform or Script node"
                      accentColor="purple"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Node config panel */}
        {selectedNode && (
          <NodeConfigPanel
            selectedNode={selectedNode}
            nodes={nodes}
            updateNodeData={updateNodeData}
            deleteNode={id => deleteElement(id, 'node')}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>

      {/* ── VS Code-style status bar ─────────────────────────────────────── */}
      <div className="h-7 shrink-0 bg-[#0d0d0d] border-t border-white/5 flex items-center px-4 justify-between z-50 text-[11px] font-medium text-white/30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`flex items-center gap-1.5 hover:text-white/70 transition-colors ${isTerminalOpen ? 'text-white/60' : ''}`}
          >
            <Terminal size={12} className={isTerminalOpen ? 'text-emerald-400' : ''} />
            Terminal
            {isTerminalOpen ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
          </button>
          {isRunning && (
            <span className="flex items-center gap-1.5 text-emerald-400 animate-pulse">
              <Activity size={11} /> Running…
            </span>
          )}
          {!isRunning && errorCount > 0 && (
            <span className="flex items-center gap-1.5 text-red-400/70">
              <AlertCircle size={11} /> {errorCount} error{errorCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>{nodes.length} nodes</span>
          <span>{edges.length} edges</span>
          {isDirty && <span className="text-amber-400/60">● unsaved</span>}
        </div>
      </div>
    </div>
  );
}

export default function WorkflowCanvasWrapper({ initialData, onSave }) {
  return (
    <ReactFlowProvider>
      <CanvasEditor initialData={initialData} onSave={onSave} />
    </ReactFlowProvider>
  );
}