'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Globe, Lock, MoreVertical, Star, Users, Folder } from 'lucide-react';

export function WorkspaceItem({ ws, viewMode, isStarred, onToggleStar, activeMenuId, setActiveMenuId }) {
    const isGrid = viewMode === 'grid';

    const memberCount = ws.members?.length || 1;
    const derivedType = memberCount > 1 ? 'Team' : 'Personal';
    const derivedAccess = memberCount > 1 ? 'Shared' : 'Private';
    const collectionCount = ws._count?.collections || 0;
    
    // Format the Prisma updatedAt timestamp
    const lastActiveDate = new Date(ws.updatedAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    return (
        <Link href={`/workspace/${ws.id}`} className="group relative">
            <div className={`${isGrid
                    ? 'h-full flex flex-col p-5'
                    : 'flex items-center p-3 sm:p-4'
                } bg-bg-panel border border-border-subtle rounded-xl hover:border-brand-orange/50 transition-all hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:bg-bg-sidebar/40`}
            >
                {/* ICON & MENU ROW (Grid View Header) */}
                {isGrid && (
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-bg-sidebar to-bg-base border border-border-subtle flex items-center justify-center text-text-secondary font-mono text-sm group-hover:text-brand-orange transition-colors">
                            {ws.name.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="relative">
                            <button
                                onClick={(e) => setActiveMenuId(e, ws.id)}
                                className={`p-1 transition-colors ${activeMenuId === ws.id ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
                            >
                                <MoreVertical size={18} />
                            </button>
                            <AnimatePresence>
                                {activeMenuId === ws.id && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                        className="absolute right-0 top-full mt-2 w-40 bg-bg-panel border border-border-strong rounded-lg shadow-xl z-50 overflow-hidden flex flex-col"
                                    >
                                        <button className="w-full text-left px-4 py-2 text-xs hover:bg-bg-sidebar text-text-primary">Edit</button>
                                        <button className="w-full text-left px-4 py-2 text-xs hover:bg-red-500/10 text-red-500">Delete</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* ICON (List View Only) */}
                {!isGrid && (
                    <div className="w-10 h-10 flex-shrink-0 rounded bg-bg-input border border-border-subtle flex items-center justify-center text-xs font-mono text-text-muted group-hover:text-brand-orange mr-4">
                        {ws.name.substring(0, 2).toUpperCase()}
                    </div>
                )}

                {/* MAIN TEXT CONTENT */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`${isGrid ? 'text-lg font-bold' : 'text-sm font-medium'} truncate group-hover:text-brand-orange transition-colors`}>
                            {ws.name}
                        </h3>
                        <Star
                            size={14}
                            onClick={(e) => onToggleStar(e, ws.id)}
                            className={`flex-shrink-0 cursor-pointer transition-all ${isStarred
                                    ? 'text-yellow-500 fill-yellow-500 opacity-100'
                                    : 'text-text-muted opacity-0 group-hover:opacity-100 hover:text-yellow-500'
                                }`}
                        />
                    </div>
                    <p className={`text-text-secondary text-sm ${isGrid ? 'line-clamp-2 mb-6' : 'truncate max-w-md'}`}>
                        {ws.description || "No description provided."}
                    </p>
                </div>

                {/* METADATA & ACTIONS (List View Header) */}
                {!isGrid && (
                    <div className="flex items-center gap-4 sm:gap-8 ml-4">
                        <div className="hidden lg:flex items-center gap-8 text-xs text-text-secondary">
                            <div className="w-24 flex items-center gap-1.5"><Users size={14} className="text-text-muted" /> <span>{derivedType}</span></div>
                            <div className="w-24 flex items-center gap-1.5">{derivedAccess === 'Private' ? <Lock size={14} className="text-text-muted" /> : <Globe size={14} className="text-text-muted" />} <span>{derivedAccess}</span></div>
                            <div className="w-32 flex items-center gap-1.5 font-mono text-text-muted"><Clock size={14} className="text-text-muted" /> <span>{lastActiveDate}</span></div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={(e) => setActiveMenuId(e, ws.id)}
                                className={`p-2 transition-all ${activeMenuId === ws.id ? 'opacity-100 text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
                            >
                                <MoreVertical size={18} />
                            </button>
                            <AnimatePresence>
                                {activeMenuId === ws.id && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                        className="absolute right-0 top-full mt-2 w-40 bg-bg-panel border border-border-strong rounded-lg shadow-xl z-50 overflow-hidden flex flex-col"
                                    >
                                        <button className="w-full text-left px-4 py-2 text-xs hover:bg-bg-sidebar text-text-primary">Edit</button>
                                        <button className="w-full text-left px-4 py-2 text-xs hover:bg-red-500/10 text-red-500">Delete</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* METRICS FOOTER (Grid View Only) */}
                {isGrid && (
                    <div className="mt-auto pt-4 border-t border-border-subtle flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-text-muted" title={`${memberCount} Member(s)`}>
                            <Users size={14} /> 
                            {memberCount}
                        </div>
                        
                        <div className="flex items-center gap-2 font-mono text-text-muted" title={`${collectionCount} Collection(s)`}>
                            <Folder size={14} className="text-brand-orange/70" />
                            {collectionCount}
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}