'use client';

import { useState } from 'react';
import { Layers, Plus, Edit2, Globe, Check, MoreHorizontal, Pin } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import ContextMenu from '../ui/ContextMenu';
import { useModal } from '@/components/providers/ModalProvider';

export default function SidebarEnvironments() {
    const store = useAppStore();
    const envs = store.getWorkspaceEnvironments();
    const [contextMenu, setContextMenu] = useState({ x: null, y: null, targetId: null });
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const { showConfirm } = useModal();

    const handleContextMenu = (e, envId) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, targetId: envId });
    };

    const startRenaming = (env) => {
        setRenamingId(env.id);
        setRenameValue(env.name);
        setContextMenu({ x: null, y: null, targetId: null });
    };

    const submitRename = () => {
        if (renamingId && renameValue.trim()) {
            store.renameItem(renamingId, renameValue.trim(), false); // false = don't mark as unsaved (auto-save)
        }
        setRenamingId(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') submitRename();
        if (e.key === 'Escape') setRenamingId(null);
    };

    const pinnedEnvs = envs.filter(e => e.pinned);
    const unpinnedEnvs = envs.filter(e => !e.pinned);

    const renderEnvItem = (env) => {
        const isRenaming = renamingId === env.id;
        const globalIdx = envs.findIndex(e => e.id === env.id);

        return (
            <div
                key={env.id}
                className={`group flex items-center justify-between p-2 rounded cursor-pointer border border-transparent transition-all mb-0.5 ${isRenaming ? 'bg-bg-input' : 'hover:bg-bg-input'
                    }`}
                onClick={() => !isRenaming && store.openTab(env.id, true)}
                onDoubleClick={() => !isRenaming && store.openTab(env.id, false)}
                onContextMenu={(e) => !isRenaming && handleContextMenu(e, env.id)}
            >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                    {/* Active Selection Checkbox */}
                    <div
                        onClick={(e) => { e.stopPropagation(); store.setSelectedEnvIndex(globalIdx); }}
                        className={`w-3 h-3 rounded-full border flex items-center justify-center transition-all shrink-0 ${globalIdx === store.selectedEnvIndex
                            ? 'bg-brand-primary border-brand-primary'
                            : 'border-border-strong hover:border-brand-primary'
                            }`}
                    >
                        {globalIdx === store.selectedEnvIndex && <Check size={8} className="text-black" strokeWidth={4} />}
                    </div>

                    {isRenaming ? (
                        <input
                            autoFocus
                            className="bg-transparent text-sm w-full outline-none text-text-primary border-b border-brand-primary"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={submitRename}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <div className="flex items-center gap-2 overflow-hidden w-full">
                            <span className="text-sm truncate text-text-primary flex-1">{env.name}</span>
                            {env.pinned && <Pin size={10} className="text-text-secondary shrink-0 rotate-45" />}
                        </div>
                    )}
                </div>

                {!isRenaming && (
                    <div
                        className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-text-primary"
                        onClick={(e) => handleContextMenu(e, env.id)}
                    >
                        <MoreHorizontal size={14} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="flex-1 flex flex-col h-full bg-transparent">
                <div className="p-3">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Environments</span>
                        <button
                            onClick={() => store.createEnvironment({ isTemp: true })}
                            className="text-text-secondary hover:text-brand-primary hover:bg-bg-input p-1 rounded transition"
                            title="Create Environment"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="space-y-1">
                        {/* Globals - Fixed */}
                        <div className="flex items-center gap-3 p-2 rounded text-text-secondary hover:bg-bg-input mb-2 opacity-70">
                            <Globe size={14} />
                            <span className="text-sm">Globals</span>
                        </div>

                        {/* Pinned Environments */}
                        {pinnedEnvs.length > 0 && (
                            <div className="mb-2 pb-2 border-b border-border-subtle/30">
                                <div className="text-[10px] uppercase font-bold text-text-tertiary px-2 mb-1">Pinned</div>
                                {pinnedEnvs.map(env => renderEnvItem(env))}
                            </div>
                        )}

                        {/* Unpinned Environments */}
                        {unpinnedEnvs.map(env => renderEnvItem(env))}
                    </div>
                </div>
            </div>

            {contextMenu.targetId && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu({ x: null, y: null, targetId: null })}
                    isPinned={envs.find(e => e.id === contextMenu.targetId)?.pinned}
                    onPin={() => {
                        store.togglePinItem(contextMenu.targetId);
                        setContextMenu({ x: null, y: null, targetId: null });
                    }}
                    onRename={() => startRenaming(envs.find(e => e.id === contextMenu.targetId))}
                    onDuplicate={() => {
                        store.createEnvironment({ name: `${envs.find(e => e.id === contextMenu.targetId)?.name} Copy`, isTemp: true });
                        setContextMenu({ x: null, y: null, targetId: null });
                    }}
                    onDelete={() => {
                        showConfirm(
                            'Are you sure you want to delete this environment?',
                            () => {
                                store.deleteEnvironment(contextMenu.targetId);
                            },
                            'Delete Environment'
                        );
                        setContextMenu({ x: null, y: null, targetId: null });
                    }}
                />
            )}
        </>
    );
}
