'use client';
import { useState } from 'react';
import { Activity, MoreHorizontal, CheckCircle2, AlertCircle, Pin } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import ContextMenu from '@/components/ui/ContextMenu';

export default function SidebarMonitors() {
    const {
        monitorStates,
        activeTabId,
        openTab,
        renameItem,
        deleteItem,
        duplicateItem,
        togglePinItem
    } = useAppStore();

    // Local State for UI interactions
    const [contextMenu, setContextMenu] = useState({ x: null, y: null, id: null });
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');

    // Convert object to array and sort: Pinned first, then Alphabetical
    const monitors = Object.values(monitorStates).sort((a, b) => {
        if (a.pinned === b.pinned) return a.name.localeCompare(b.name);
        return a.pinned ? -1 : 1;
    });

    // --- Context Menu Handlers ---
    const handleContextMenu = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, id });
    };

    const handleMenuClose = () => setContextMenu({ x: null, y: null, id: null });

    const handleMenuAction = (action) => {
        if (!contextMenu.id) return;

        switch (action) {
            case 'rename':
                const item = monitorStates[contextMenu.id];
                setRenamingId(contextMenu.id);
                setRenameValue(item.name);
                break;
            case 'duplicate':
                duplicateItem(contextMenu.id);
                break;
            case 'delete':
                deleteItem(contextMenu.id);
                break;
            case 'pin':
                togglePinItem(contextMenu.id);
                break;
        }
        handleMenuClose();
    };

    // --- Rename Handlers ---
    const handleRenameSubmit = () => {
        if (renamingId && renameValue.trim()) {
            renameItem(renamingId, renameValue.trim());
        }
        setRenamingId(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleRenameSubmit();
        if (e.key === 'Escape') setRenamingId(null);
    };

    // --- Helper for Status Icon ---
    const renderStatus = (status) => {
        if (status === 'unhealthy') return <AlertCircle size={12} className="text-red-500" />;
        return <CheckCircle2 size={12} className="text-method-get" />;
    };

    return (
        <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
            <div className="flex flex-col gap-1">
                <AnimatePresence>
                    {monitors.map((monitor) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            key={monitor.id}
                            onContextMenu={(e) => handleContextMenu(e, monitor.id)}

                            // 1. Single Click: Opens as Preview (Temporary)
                            onClick={() => openTab(monitor.id, true)}

                            // 2. Double Click: Opens as Permanent (false = not preview)
                            // Note: React fires onClick before onDoubleClick, so the tab 
                            // opens as preview first, then immediately converts to permanent.
                            onDoubleClick={() => openTab(monitor.id, false)}

                            className={`
                                group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors select-none relative
                                ${activeTabId === monitor.id
                                    ? 'bg-bg-input text-text-primary border-l-2 border-brand-primary'
                                    : 'text-text-secondary hover:bg-bg-panel hover:text-text-primary border-l-2 border-transparent'}
                            `}
                        >
                            {/* Icon / Status */}
                            <div className="flex items-center justify-center shrink-0">
                                {monitor.status ? (
                                    renderStatus(monitor.status)
                                ) : (
                                    <Activity size={14} className={activeTabId === monitor.id ? 'text-brand-primary' : 'text-text-secondary'} />
                                )}
                            </div>

                            {/* Name or Rename Input */}
                            <div className="flex-1 min-w-0">
                                {renamingId === monitor.id ? (
                                    <input
                                        autoFocus
                                        type="text"
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onBlur={handleRenameSubmit}
                                        onKeyDown={handleKeyDown}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full bg-bg-base border border-brand-blue rounded px-1 py-0.5 text-xs text-text-primary focus:outline-none"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium truncate">{monitor.name}</span>
                                        {monitor.pinned && <Pin size={10} className="text-text-muted shrink-0 rotate-45" />}
                                    </div>
                                )}
                            </div>

                            {/* Hover Actions (Three Dots) */}
                            <div
                                className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${contextMenu.id === monitor.id ? 'opacity-100' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setContextMenu({ x: e.clientX, y: e.clientY, id: monitor.id });
                                }}
                            >
                                <div className="p-1 hover:bg-bg-base rounded hover:text-text-primary text-text-muted">
                                    <MoreHorizontal size={14} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {monitors.length === 0 && (
                    <div className="text-center mt-10 opacity-50">
                        <Activity size={32} className="mx-auto mb-2 text-text-muted" />
                        <p className="text-xs text-text-secondary">No monitors created</p>
                    </div>
                )}
            </div>

            {/* Context Menu Overlay */}
            <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                isPinned={contextMenu.id ? monitorStates[contextMenu.id]?.pinned : false}
                onClose={handleMenuClose}
                onRename={() => handleMenuAction('rename')}
                onDuplicate={() => handleMenuAction('duplicate')}
                onDelete={() => handleMenuAction('delete')}
                onPin={() => handleMenuAction('pin')}
            />
        </div>
    );
}
