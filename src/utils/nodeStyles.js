// Shared node style utilities — used across all node components

export const getNodeStatus = (status) => ({
  isRunning: status === 'running',
  isSuccess: status === 'success',
  isFailed: status === 'failed',
  isIdle: !status || status === 'idle',
});

export const nodeAccents = {
  startNode:     { color: '#10b981', glow: 'rgba(16,185,129,0.35)',  label: 'emerald' },
  endNode:       { color: '#ef4444', glow: 'rgba(239,68,68,0.35)',   label: 'red' },
  requestNode:   { color: '#3b82f6', glow: 'rgba(59,130,246,0.35)',  label: 'blue' },
  conditionNode: { color: '#a855f7', glow: 'rgba(168,85,247,0.35)',  label: 'purple' },
  transformNode: { color: '#60a5fa', glow: 'rgba(96,165,250,0.35)',  label: 'blue' },
  delayNode:     { color: '#f59e0b', glow: 'rgba(245,158,11,0.35)',  label: 'amber' },
  testNode:      { color: '#ec4899', glow: 'rgba(236,72,153,0.35)',  label: 'pink' },
  scriptNode:    { color: '#22d3ee', glow: 'rgba(34,211,238,0.35)',  label: 'cyan' },
};

export const statusRingClass = (status, accentColor) => {
  if (status === 'running') return `border-[${accentColor}] shadow-[0_0_20px_${accentColor}]`;
  if (status === 'success') return 'border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
  if (status === 'failed')  return 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]';
  return 'border-white/10 hover:border-white/25';
};