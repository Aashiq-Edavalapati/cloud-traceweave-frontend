import { useState, useRef, useEffect } from 'react';
import { Check, ArrowRightLeft, Box, Zap, Activity, ChevronDown } from 'lucide-react';

const PROTOCOLS = [
  { id: 'http', label: 'HTTP', icon: ArrowRightLeft, color: 'text-emerald-500' },
  { id: 'graphql', label: 'GraphQL', icon: Box, color: 'text-pink-500' },
  // { id: 'grpc', label: 'gRPC', icon: Zap, color: 'text-blue-400' },
  { id: 'websocket', label: 'WebSocket', icon: Activity, color: 'text-brand-primary' },
];

export default function ProtocolSwitcher({ currentProtocol = 'http', onChange }) {
  const activeProtocol = PROTOCOLS.find(p => p.id === currentProtocol) || PROTOCOLS[0];
  const ActiveIcon = activeProtocol.icon;

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative ml-2 shrink-0" ref={menuRef}>
      <span 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-1.5 py-0.5 bg-bg-panel border border-border-subtle rounded text-text-secondary cursor-pointer hover:text-text-primary hover:border-text-secondary transition-colors text-[10px]"
        title="Change Protocol"
      >
        <ActiveIcon size={11} className={activeProtocol.color} />
        {activeProtocol.label}
        <ChevronDown size={10} className="text-text-muted ml-0.5" />
      </span>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[140px] bg-bg-panel border border-border-strong rounded shadow-xl py-1 z-[60] flex flex-col">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Switch Protocol
          </div>
          {PROTOCOLS.map((proto) => {
            const Icon = proto.icon;
            const isSelected = proto.id === currentProtocol;
            return (
              <div
                key={proto.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(proto.id);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  isSelected ? 'bg-bg-input/80 text-text-primary' : 'hover:bg-bg-input/50 text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon size={14} className={proto.color} />
                <span>{proto.label}</span>
                {isSelected && <Check size={12} className="ml-auto text-brand-primary" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
