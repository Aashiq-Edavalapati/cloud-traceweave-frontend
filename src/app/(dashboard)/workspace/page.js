'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link'; 
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Plus,
    Filter,
    LayoutGrid,
    List as ListIcon,
    Star,
    ChevronLeft,
    Loader2
} from 'lucide-react';
import { FilterPopover } from '@/components/workspace/FilterPopover';
import { WorkspaceItem } from '@/components/workspace/WorkspaceItem';
import { CreateWorkspaceModal } from '@/components/home/auth_landing/CreateWorkspaceModal';
import { useAppStore } from '@/store/useAppStore';
import { useModal } from '@/components/providers/ModalProvider';

export default function WorkspacesPage() {
    const { 
        availableWorkspaces, 
        fetchWorkspaces, 
        duplicateWorkspace, 
        deleteWorkspace,
        toggleFavorite // Get this from your store
    } = useAppStore();
    
    const { showConfirm, showAlert } = useModal();

    const [viewMode, setViewMode] = useState('list');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [editData, setEditData] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [activeFilters, setActiveFilters] = useState({ type: [], access: [] });
    const [pendingFilters, setPendingFilters] = useState({ type: [], access: [] });
    const [searchQuery, setSearchQuery] = useState('');
    // REMOVED: const [starredIds, setStarredIds] = useState([]); <--- No longer needed
    const [showOnlyStarred, setShowOnlyStarred] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (e.target.closest('.dropdown-container')) return;
            setActiveMenuId(null);
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleApplyFilters = () => {
        setActiveFilters(pendingFilters);
        setIsFilterOpen(false);
    };

    // FIXED: Now calls the store to persist the favorite in the DB
    const handleToggleStar = (e, id) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        toggleFavorite(id); 
    };

    const handleMenuClick = (e, id) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent?.stopImmediatePropagation();
        }
        setActiveMenuId(prev => prev === id ? null : id);
    };

    const handleEdit = (ws) => {
        setEditData(ws);
        setIsEditModalOpen(true);
    };

    const handleDuplicate = async (ws) => {
        setIsProcessing(true);
        try {
            const result = await duplicateWorkspace(ws.id);
            if (result.success) {
                showAlert(`"${ws.name}" has been cloned successfully. Only you have access to the new copy.`, "Success");
            } else {
                showAlert(result.error, "Duplicate Failed");
            }
        } catch (err) {
            showAlert("An unexpected error occurred during duplication.", "Error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = (ws) => {
        showConfirm(
            `Are you sure you want to terminate "${ws.name}"? This action is permanent and all data (collections, workflows, and environments) within this workspace will be lost.`,
            async () => {
                const result = await deleteWorkspace(ws.id);
                if (!result.success) {
                    showAlert(result.error, "Error");
                }
            },
            "Terminate Workspace"
        );
    };

    // --- SORTING & FILTERING LOGIC ---
    const displayedWorkspaces = useMemo(() => {
        // 1. Filter the workspaces
        const filtered = availableWorkspaces.filter(ws => {
            const matchesSearch = ws.name.toLowerCase().includes(searchQuery.toLowerCase());
            const memberCount = ws.members?.length || 1;
            const derivedType = memberCount > 1 ? 'Team' : 'Personal';
            const derivedAccess = memberCount > 1 ? 'Shared' : 'Private';
            
            const matchesType = activeFilters.type.length === 0 || activeFilters.type.includes(derivedType);
            const matchesAccess = activeFilters.access.length === 0 || activeFilters.access.includes(derivedAccess);
            
            // FIXED: Check ws.isFavorite instead of local state
            const matchesStarred = !showOnlyStarred || ws.isFavorite;

            return matchesSearch && matchesType && matchesAccess && matchesStarred;
        });

        // 2. Sort: Favorites first, then by updatedAt (Recency)
        return [...filtered].sort((a, b) => {
            // FIXED: Use the property from the DB
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;

            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    }, [availableWorkspaces, searchQuery, activeFilters, showOnlyStarred]);

    return (
        <div className="relative min-h-screen bg-bg-base text-text-primary p-6 md:p-12">
            <AnimatePresence>
                {isProcessing && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-primary animate-pulse" size={24} />
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-white tracking-tight">Cloning Workspace</h2>
                            <p className="text-text-muted text-sm mt-1">Deep-copying assets and creating independent records...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto">
                <nav className="mb-8">
                    <Link 
                        href="/" 
                        className="flex items-center gap-2 text-text-muted hover:text-brand-primary transition-colors w-fit group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                </nav>

                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-4xl font-bold tracking-tight text-text-primary">Workspaces</h1>
                            <span className="px-2.5 py-0.5 rounded-md bg-brand-surface/30 border border-brand-primary/20 text-xs font-mono text-brand-primary">
                                {displayedWorkspaces.length} Total
                            </span>
                        </div>
                        <p className="text-text-secondary text-base max-w-lg">
                            Manage your API collections, environments, and distributed tracing contexts in one place.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-brand-primary text-brand-surface px-6 py-3 rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all glow-primary"
                    >
                        <Plus size={20} />
                        New Workspace
                    </button>
                </header>

                <section className="sticky top-4 z-40 mb-8">
                    <div className="glass-strong p-2 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 shadow-2xl border border-white/5">
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search workspaces..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-bg-input/50 border border-border-subtle rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <button
                                onClick={() => setShowOnlyStarred(!showOnlyStarred)}
                                className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition-all ${
                                    showOnlyStarred
                                    ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                                    : 'bg-bg-input/50 border-border-subtle text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                <Star size={16} fill={showOnlyStarred ? "currentColor" : "none"} />
                                <span className="hidden sm:inline">Favorites</span>
                            </button>

                            <div className="relative dropdown-container">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsFilterOpen(!isFilterOpen);
                                        if (!isFilterOpen) setPendingFilters(activeFilters);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition-colors ${
                                        isFilterOpen || activeFilters.type.length > 0 || activeFilters.access.length > 0
                                        ? 'bg-brand-surface border-brand-primary text-brand-primary'
                                        : 'bg-bg-input/50 border-border-subtle text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    <Filter size={16} />
                                    <span className="hidden sm:inline">Filter</span>
                                </button>

                                <AnimatePresence>
                                    {isFilterOpen && (
                                        <FilterPopover
                                            isOpen={isFilterOpen}
                                            onClose={() => setIsFilterOpen(false)}
                                            pendingFilters={pendingFilters}
                                            setPendingFilters={setPendingFilters}
                                            onApply={handleApplyFilters}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="h-8 w-[1px] bg-border-subtle mx-1 hidden sm:block" />

                            <div className="bg-bg-input/50 border border-border-subtle rounded-xl p-1 flex items-center">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-surface text-brand-primary shadow-lg' : 'text-text-muted hover:text-text-secondary'}`}
                                >
                                    <ListIcon size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-surface text-brand-primary shadow-lg' : 'text-text-muted hover:text-text-secondary'}`}
                                >
                                    <LayoutGrid size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <main className="relative z-10">
                    {displayedWorkspaces.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-border-subtle rounded-3xl bg-bg-panel/10">
                            <div className="p-4 rounded-full bg-brand-surface/20 mb-4">
                                <Search size={40} className="text-brand-primary/40" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No workspaces found</h3>
                            <p className="text-text-muted text-center max-w-xs px-4">
                                We couldn't find anything matching your current filters or search query.
                            </p>
                            {(activeFilters.type.length > 0 || showOnlyStarred || searchQuery) && (
                                <button
                                    onClick={() => {
                                        setActiveFilters({ type: [], access: [] });
                                        setShowOnlyStarred(false);
                                        setSearchQuery('');
                                    }}
                                    className="mt-6 text-brand-primary text-sm font-bold hover:opacity-80 transition-opacity px-6 py-2 border border-brand-primary/20 rounded-lg"
                                >
                                    Reset all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' 
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                            : 'flex flex-col gap-3'
                        }>
                            {displayedWorkspaces.map((ws) => (
                                <WorkspaceItem
                                    key={ws.id}
                                    ws={ws}
                                    viewMode={viewMode}
                                    isStarred={ws.isFavorite}
                                    onToggleStar={handleToggleStar}
                                    activeMenuId={activeMenuId}
                                    setActiveMenuId={handleMenuClick}
                                    onEdit={handleEdit}
                                    onDuplicate={handleDuplicate}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </main>

                <CreateWorkspaceModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />

                <CreateWorkspaceModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditData(null);
                    }}
                    editData={editData}
                />
            </div>
        </div>
    );
}