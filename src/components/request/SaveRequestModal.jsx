'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FolderPlus, Folder } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function SaveRequestModal({ isOpen, onClose, requestId }) {
    const store = useAppStore();
    const [selectedCollectionId, setSelectedCollectionId] = useState(null);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isCreatingCol, setIsCreatingCol] = useState(false);

    // Portal mounting state
    const [mounted, setMounted] = useState(false);

    // FIX: Added useEffect to mount the portal on the client side
    useEffect(() => {
        setMounted(true);
    }, []);

    // Get Request Name
    const request = store.requestStates[requestId];
    const [requestName, setRequestName] = useState(request?.name || 'My Request');

    const collections = store.getFilteredCollections();

    if (!isOpen || !mounted) return null;

    const handleSave = () => {
        if (!selectedCollectionId) return;
        store.attachRequestToCollection(requestId, selectedCollectionId, requestName);
        onClose();
    };

    const handleCreateCollection = () => {
        if (!newCollectionName) return;
        store.createCollection(newCollectionName);
        setIsCreatingCol(false);
        setNewCollectionName('');
        // Ideally we would select the new collection automatically, 
        // but for now we just refresh the list (auto via store)
    };

    const modalContent = (
        // Increased z-index to 9999
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-bg-panel border border-border-strong rounded-lg shadow-2xl w-[450px] overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="px-5 py-3 border-b border-border-subtle flex justify-between items-center bg-bg-base">
                    <h2 className="text-sm font-bold text-text-primary">Save Request</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><X size={16} /></button>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 overflow-y-auto">
                    {/* Request Name Input */}
                    <div className="mb-4">
                        <label className="text-xs font-semibold text-text-secondary mb-1 block">Request Name</label>
                        <input
                            type="text"
                            value={requestName}
                            onChange={(e) => setRequestName(e.target.value)}
                            className="w-full bg-bg-input border border-border-subtle rounded p-2 text-sm text-text-primary focus:border-brand-primary outline-none"
                        />
                    </div>

                    {/* Collection Selection */}
                    <div className="mb-2 flex justify-between items-end">
                        <label className="text-xs font-semibold text-text-secondary block">Select a Collection</label>
                        <button
                            onClick={() => setIsCreatingCol(!isCreatingCol)}
                            className="text-[10px] text-brand-blue hover:underline flex items-center gap-1"
                        >
                            <FolderPlus size={12} /> New Collection
                        </button>
                    </div>

                    {/* Inline Create Collection */}
                    {isCreatingCol && (
                        <div className="flex gap-2 mb-3 animate-in fade-in slide-in-from-top-2">
                            <input
                                type="text"
                                placeholder="Collection Name"
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                className="flex-1 bg-bg-base border border-brand-primary rounded px-2 text-xs focus:outline-none"
                                autoFocus
                            />
                            <button
                                onClick={handleCreateCollection}
                                className="text-xs bg-bg-input hover:bg-border-subtle px-2 rounded border border-border-subtle"
                            >
                                Create
                            </button>
                        </div>
                    )}

                    {/* Collection List */}
                    <div className="border border-border-subtle rounded bg-bg-base h-40 overflow-y-auto custom-scrollbar">
                        {collections.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-text-secondary text-xs opacity-50">
                                <Folder size={24} className="mb-2" />
                                No collections found
                            </div>
                        ) : (
                            collections.map(col => (
                                <div
                                    key={col.id}
                                    onClick={() => setSelectedCollectionId(col.id)}
                                    className={`px-3 py-2 flex items-center gap-2 cursor-pointer text-xs border-b border-border-subtle last:border-0 hover:bg-bg-input ${selectedCollectionId === col.id ? 'bg-brand-primary/20 text-brand-primary font-semibold' : 'text-text-primary'}`}
                                >
                                    <Folder size={14} className={selectedCollectionId === col.id ? 'fill-brand-primary' : ''} />
                                    {col.name}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-border-subtle bg-bg-base flex justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary font-medium">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={!selectedCollectionId}
                        className="bg-brand-primary text-brand-surface px-4 py-1.5 rounded text-xs font-black hover:bg-brand-glow transition disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-sm"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );

    // Return the portal targeting document.body
    return createPortal(modalContent, document.body);
}
