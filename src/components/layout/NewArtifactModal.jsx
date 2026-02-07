'use client';
import { useState } from 'react';
import { X, Zap, Hexagon, Activity, Folder, Layers, LayoutGrid, GitBranch, ArrowRightLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const ARTIFACTS = [
    { id: 'http', label: 'HTTP', icon: ArrowRightLeft, desc: 'Create a standard REST/HTTP request.' },
    { id: 'graphql', label: 'GraphQL', icon: Hexagon, desc: 'Query data using GraphQL language.' },
    { id: 'grpc', label: 'gRPC', icon: Zap, desc: 'High-performance RPC framework.' },
    { id: 'websocket', label: 'WebSocket', icon: Activity, desc: 'Full-duplex communication channel.' },
    { id: 'collection', label: 'Collection', icon: Folder, desc: 'Folder to organize requests.' },
    { id: 'environment', label: 'Environment', icon: Layers, desc: 'Global variable sets.' },
    { id: 'flow', label: 'Flow', icon: GitBranch, desc: 'Visual API workflow builder (Coming Soon).' },
    { id: 'workspace', label: 'Workspace', icon: LayoutGrid, desc: 'Project isolation container (Coming Soon).' },
];

export default function NewArtifactModal({ isOpen, onClose }) {
    const store = useAppStore();
    const [hoveredId, setHoveredId] = useState(null);

    if (!isOpen) return null;

    const handleCreate = (id) => {
        switch(id) {
            case 'http':
            case 'graphql':
            case 'grpc':
            case 'websocket':
                store.createDetachedRequest(id); 
                break;
            case 'collection':
                store.createCollection();
                break;
            case 'environment':
                store.createEnvironment({ name: 'Untitled Environment', isTemp: true });
                break;
            default:
                console.log("Feature pending implementation:", id);
        }
        onClose();
    };

    const activeDesc = ARTIFACTS.find(a => a.id === hoveredId)?.desc || 'Select an item to create...';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={onClose} />
            
            <div className="bg-[#1e1e1e] border border-border-strong rounded-xl shadow-2xl w-[600px] overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-bg-panel">
                    <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                        Create New Artifact
                    </h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Grid */}
                <div className="p-6 grid grid-cols-4 gap-4 bg-bg-base">
                    {ARTIFACTS.map(item => (
                        <button 
                            key={item.id}
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => handleCreate(item.id)}
                            className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg bg-bg-input/30 border border-transparent hover:bg-bg-input hover:border-brand-orange/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 aspect-square group text-center"
                        >
                            <item.icon size={24} className="text-text-secondary group-hover:text-brand-orange transition-colors duration-200" />
                            <span className="text-xs font-medium text-text-primary">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Footer / Description */}
                <div className="px-6 py-3 bg-bg-panel border-t border-border-subtle text-xs text-text-secondary h-14 flex items-center">
                    <span className="font-mono text-brand-orange mr-2">{'>'}</span> {activeDesc}
                </div>
            </div>
        </div>
    );
}