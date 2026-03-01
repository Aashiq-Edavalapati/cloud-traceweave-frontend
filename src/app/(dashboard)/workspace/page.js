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
    }, []);

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
        <div className="min-h-screen bg-bg-base text-text-primary flex flex-col p-8 max-w-7xl mx-auto w-full">

            {/* Navigation / Breadcrumb Area */}
            <div className="mb-6">
                <Link 
                    href="/" 
                    className="flex items-center gap-2 text-text-secondary hover:text-brand-orange transition-colors w-fit group"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-sm font-medium">Back to Home</span>
                </Link>
            </div>

            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
                        <span className="px-2 py-0.5 rounded-full bg-bg-panel border border-border-subtle text-xs text-text-secondary">
                            {filteredWorkspaces.length}
                        </span>
                    </div>
                    <p className="text-text-secondary text-sm">
                        Manage your API collections and distributed tracing contexts.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-orange text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(255,108,55,0.2)]"
                >
                    <Plus size={18} />
                    Create Workspace
                </button>
            </div>

            {/* 2. Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6 sticky top-0 z-30 bg-bg-base/95 backdrop-blur py-2">
                <div className="relative flex-1 max-w-lg group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-orange transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search workspaces..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-bg-input border border-border-subtle rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-orange transition-all"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowOnlyStarred(!showOnlyStarred)}
                        className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium transition-all ${showOnlyStarred
                            ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                            : 'bg-bg-input border-border-subtle text-text-secondary hover:text-text-primary'
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
                            className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium transition-colors ${isFilterOpen || activeFilters.type.length > 0 || activeFilters.access.length > 0
                                ? 'bg-bg-panel border-brand-orange text-brand-orange'
                                : 'bg-bg-input border-border-subtle text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            <Filter size={16} />
                            <span className="hidden sm:inline">Filter</span>
                            {(activeFilters.type.length > 0 || activeFilters.access.length > 0) && (
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                            )}
                        </button>

                        <AnimatePresence>
                            <FilterPopover
                                isOpen={isFilterOpen}
                                onClose={() => setIsFilterOpen(false)}
                                pendingFilters={pendingFilters}
                                setPendingFilters={setPendingFilters}
                                onApply={handleApplyFilters}
                            />
                        </AnimatePresence>
                    </div>

                    <div className="bg-bg-input border border-border-subtle rounded-lg p-1 flex items-center">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-bg-panel shadow-sm text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
                        >
                            <ListIcon size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-bg-panel shadow-sm text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Content Area */}
            {filteredWorkspaces.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border-subtle rounded-xl bg-bg-panel/20">
                    <Search size={32} className="text-text-muted mb-4" />
                    <h3 className="text-lg font-medium mb-1">No results match your criteria</h3>
                    <p className="text-text-secondary text-sm">Try clearing filters or checking your favorites.</p>
                    {(activeFilters.type.length > 0 || showOnlyStarred) && (
                        <button
                            onClick={() => {
                                setActiveFilters({ type: [], access: [] });
                                setShowOnlyStarred(false);
                            }}
                            className="mt-4 text-brand-orange text-sm font-medium hover:underline"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-2'}>
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

            <CreateWorkspaceModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}