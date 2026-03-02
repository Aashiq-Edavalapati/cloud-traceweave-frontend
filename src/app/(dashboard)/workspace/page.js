'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; 
import { AnimatePresence } from 'framer-motion';
import {
    Search,
    Plus,
    Filter,
    LayoutGrid,
    List as ListIcon,
    Star,
    ChevronLeft
} from 'lucide-react';
import { FilterPopover } from '@/components/workspace/FilterPopover';
import { WorkspaceItem } from '@/components/workspace/WorkspaceItem';
import { CreateWorkspaceModal } from '@/components/home/auth_landing/CreateWorkspaceModal';
import { useAppStore } from '@/store/useAppStore';

export default function WorkspacesPage() {
    const { availableWorkspaces, fetchWorkspaces, isLoadingWorkspaces } = useAppStore();
    const [viewMode, setViewMode] = useState('list');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [activeFilters, setActiveFilters] = useState({ type: [], access: [] });
    const [pendingFilters, setPendingFilters] = useState({ type: [], access: [] });
    const [searchQuery, setSearchQuery] = useState('');
    const [starredIds, setStarredIds] = useState([]);
    const [showOnlyStarred, setShowOnlyStarred] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleApplyFilters = () => {
        setActiveFilters(pendingFilters);
        setIsFilterOpen(false);
    };

    const toggleStar = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setStarredIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleMenuClick = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    const filteredWorkspaces = availableWorkspaces.filter(ws => {
        const matchesSearch = ws.name.toLowerCase().includes(searchQuery.toLowerCase());
        const memberCount = ws.members?.length || 1;
        const derivedType = memberCount > 1 ? 'Team' : 'Personal';
        const derivedAccess = memberCount > 1 ? 'Shared' : 'Private';
        const matchesType = activeFilters.type.length === 0 || activeFilters.type.includes(derivedType);
        const matchesAccess = activeFilters.access.length === 0 || activeFilters.access.includes(derivedAccess);
        const matchesStarred = !showOnlyStarred || starredIds.includes(ws.id);

        return matchesSearch && matchesType && matchesAccess && matchesStarred;
    });

    return (
        /* Removed flex-col from main wrapper to prevent height trapping */
        <div className="relative min-h-screen bg-bg-base text-text-primary p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                
                {/* Navigation */}
                <nav className="mb-8">
                    <Link 
                        href="/" 
                        className="flex items-center gap-2 text-text-muted hover:text-brand-primary transition-colors w-fit group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                </nav>

                {/* 1. Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-4xl font-bold tracking-tight text-text-primary">Workspaces</h1>
                            <span className="px-2.5 py-0.5 rounded-md bg-brand-surface/30 border border-brand-primary/20 text-xs font-mono text-brand-primary">
                                {filteredWorkspaces.length} Total
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

                {/* 2. Toolbar - Increased Z-index and refined blur */}
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

                            <div className="relative">
                                <button
                                    onClick={() => {
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

                {/* 3. Content Area - Ensuring relative positioning for z-index containment */}
                <main className="relative z-10">
                    {filteredWorkspaces.length === 0 ? (
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
                        /* WorkspaceItems should have relative positioning inside them */
                        <div className={viewMode === 'grid' 
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                            : 'flex flex-col gap-3'
                        }>
                            {filteredWorkspaces.map((ws) => (
                                <WorkspaceItem
                                    key={ws.id}
                                    ws={ws}
                                    viewMode={viewMode}
                                    isStarred={starredIds.includes(ws.id)}
                                    onToggleStar={toggleStar}
                                    activeMenuId={activeMenuId}
                                    setActiveMenuId={handleMenuClick}
                                />
                            ))}
                        </div>
                    )}
                </main>

                <CreateWorkspaceModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            </div>
        </div>
    );
}