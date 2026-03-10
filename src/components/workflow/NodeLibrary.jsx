'use client';
import React from 'react';
import { Globe, GitBranch, Terminal, FileJson, Clock, FlaskConical, Flag } from 'lucide-react';

export default function NodeLibrary() {
  const onDragStart = (event, nodeType, defaultData) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-data', JSON.stringify(defaultData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="absolute left-4 top-4 z-10 w-48 bg-bg-panel/90 backdrop-blur border border-border-strong rounded-xl shadow-2xl p-4 flex flex-col gap-3">
      <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Node Library</h3>

      <div
        className="flex items-center gap-2 p-2 rounded-lg border border-border-subtle bg-bg-base cursor-grab hover:border-brand-blue hover:text-brand-blue transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, 'requestNode', { method: 'GET', url: 'https://api.example.com' })}
      >
        <Globe size={14} /> <span className="text-xs font-semibold">HTTP Request</span>
      </div>

      <div
        className="flex items-center gap-2 p-2 rounded-lg border border-border-subtle bg-bg-base cursor-grab hover:border-purple-500 hover:text-purple-500 transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, 'conditionNode', { expression: 'status === 200' })}
      >
        <GitBranch size={14} /> <span className="text-xs font-semibold">Condition</span>
      </div>

      <div
        className="flex items-center gap-2 p-2 rounded-lg border border-border-subtle bg-bg-base cursor-grab hover:border-blue-400 hover:text-blue-400 transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, 'transformNode', { variable: 'variables.token', expression: 'responses.node_1.body.token' })}
      >
        <FileJson size={14} /> <span className="text-xs font-semibold">Transform</span>
      </div>

      <div
        className="flex items-center gap-2 p-2 rounded-lg border border-border-subtle bg-bg-base cursor-grab hover:border-yellow-500 hover:text-yellow-500 transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, 'delayNode', { delay: 1000 })}
      >
        <Clock size={14} /> <span className="text-xs font-semibold">Delay</span>
      </div>

      <div
        className="flex items-center gap-2 p-2 rounded-lg border border-border-subtle bg-bg-base cursor-grab hover:border-pink-500 hover:text-pink-500 transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, 'testNode', { assertion: 'response.status === 200' })}
      >
        <FlaskConical size={14} /> <span className="text-xs font-semibold">Test</span>
      </div>

      <div
        className="flex items-center gap-2 p-2 rounded-lg border border-border-subtle bg-bg-base cursor-grab hover:border-cyan-400 hover:text-cyan-400 transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, 'scriptNode', { script: '// write custom JS' })}
      >
        <Terminal size={14} /> <span className="text-xs font-semibold">JS Script</span>
      </div>

      <div
        className="flex items-center gap-2 p-2 rounded-lg border border-border-subtle bg-bg-base cursor-grab hover:border-red-500 hover:text-red-500 transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, 'endNode', {})}
      >
        <Flag size={14} /> <span className="text-xs font-semibold">End</span>
      </div>
    </div>
  );
}