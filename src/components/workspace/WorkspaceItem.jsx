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
        <Link href={`/workspace/${ws.id}`} className="group relative block h-full">
            <div className={`${isGrid
                ? 'h-full flex flex-col p-6'
                : 'flex items-center p-4'
                } glass-strong border border-white/5 rounded-3xl hover:border-brand-primary/30 transition-all hover:shadow-glow-sm hover:translate-y-[-2px] relative overflow-hidden`}
            >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* ICON & MENU ROW (Grid View Header) */}
                {isGrid && (
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-brand-surface/50 border border-brand-primary/20 flex items-center justify-center text-white font-mono text-base font-black group-hover:scale-110 transition-transform shadow-inner">
                            {ws.name.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="relative">
                            <button
                                onClick={(e) => setActiveMenuId(e, ws.id)}
                                className={`p-2 rounded-xl transition-all ${activeMenuId === ws.id ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                            >
                                <MoreVertical size={18} />
                            </button>
                            <AnimatePresence>
                                {activeMenuId === ws.id && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                        className="absolute right-0 top-full mt-2 w-44 glass-strong border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col p-1"
                                    >
                                        <button className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-white/5 text-white rounded-xl transition-all">EDIT SETTINGS</button>
                                        <button className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-red-500/10 text-red-400 rounded-xl transition-all">TERMINATE</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* ICON (List View Only) */}
                {!isGrid && (
                    <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-brand-surface/50 border border-brand-primary/20 flex items-center justify-center text-sm font-black font-mono text-white group-hover:scale-110 transition-transform shadow-inner mr-6">
                        {ws.name.substring(0, 2).toUpperCase()}
                    </div>
                )}

                {/* MAIN TEXT CONTENT */}
                <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className={`${isGrid ? 'text-xl font-black' : 'text-base font-bold'} text-white truncate tracking-tight`}>
                            {ws.name}
                        </h3>
                        <Star
                            size={16}
                            onClick={(e) => onToggleStar(e, ws.id)}
                            className={`flex-shrink-0 cursor-pointer transition-all ${isStarred
                                ? 'text-yellow-500 fill-yellow-500 opacity-100'
                                : 'text-text-muted opacity-0 group-hover:opacity-100 hover:text-yellow-500'
                                }`}
                        />
                    </div>
                    <p className={`text-text-muted text-sm leading-relaxed ${isGrid ? 'line-clamp-2 mb-8' : 'truncate max-w-md'}`}>
                        {ws.description || "No description provided."}
                    </p>
                </div>

                {/* METADATA & ACTIONS (List View Header) */}
                {!isGrid && (
                    <div className="flex items-center gap-4 sm:gap-12 ml-6 relative z-10">
                        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.1em]">
                            <div className="w-24 flex items-center gap-2.5 text-text-muted"><Users size={14} className="text-brand-primary" /> <span>{derivedType}</span></div>
                            <div className="w-24 flex items-center gap-2.5 text-text-muted">{derivedAccess === 'Private' ? <Lock size={14} className="text-brand-primary" /> : <Globe size={14} className="text-brand-primary" />} <span>{derivedAccess}</span></div>
                            <div className="w-32 flex items-center gap-2.5 font-mono text-text-muted"><Clock size={14} className="text-brand-primary" /> <span>{lastActiveDate}</span></div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={(e) => setActiveMenuId(e, ws.id)}
                                className={`p-2 rounded-xl transition-all ${activeMenuId === ws.id ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                            >
                                <MoreVertical size={18} />
                            </button>
                            <AnimatePresence>
                                {activeMenuId === ws.id && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                        className="absolute right-0 top-full mt-2 w-44 glass-strong border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col p-1"
                                    >
                                        <button className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-white/5 text-white rounded-xl transition-all">EDIT SETTINGS</button>
                                        <button className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-red-500/10 text-red-400 rounded-xl transition-all">TERMINATE</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* METRICS FOOTER (Grid View Only) */}
                {isGrid && (
                    <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest relative z-10">
                        <div className="flex items-center gap-2.5 text-text-muted" title={`${memberCount} Member(s)`}>
                            <Users size={16} className="text-brand-primary" />
                            <span>{memberCount} MEMBERS</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-text-muted" title={`${collectionCount} Collection(s)`}>
                            <Folder size={16} className="text-brand-primary" />
                            <span>{collectionCount} COLLECTIONS</span>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}
