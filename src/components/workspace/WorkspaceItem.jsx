'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, 
    Globe, 
    Lock, 
    MoreVertical, 
    Star, 
    Users, 
    Folder, 
    Edit3, 
    Trash2, 
    Copy 
} from 'lucide-react';

export function WorkspaceItem({
    ws,
    viewMode,
    isStarred,
    onToggleStar,
    activeMenuId,
    setActiveMenuId,
    onEdit,
    onDelete,
    onDuplicate
}) {
    const router = useRouter();
    const isGrid = viewMode === 'grid';
    const isActive = activeMenuId === ws.id;
    
    const memberCount = ws.members?.length || 1;
    const derivedType = memberCount > 1 ? 'Team' : 'Personal';
    const derivedAccess = memberCount > 1 ? 'Shared' : 'Private';
    const collectionCount = ws._count?.collections || 0;

    const lastActiveDate = new Date(ws.updatedAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const handleAction = (e, action) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveMenuId(e, null);
        action(ws);
    };

    return (
        <div
            onClick={(e) => {
                if (e.target.closest('button') || e.target.closest('.dropdown-container')) return;
                router.push(`/workspace/${ws.id}`);
            }}
            /* FIX: 'overflow-visible' is mandatory. 
               FIX: isActive gets z-[70] to clear the z-10 title container.
            */
            className={`
                group block h-full cursor-pointer relative 
                glass-strong border border-white/5 rounded-[28px] 
                transition-all duration-300 ease-out overflow-visible
                ${isGrid ? 'flex flex-col p-7' : 'flex items-center p-4'} 
                ${isActive 
                    ? 'z-[70] bg-white/[0.04] border-brand-primary/50 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)] scale-[1.01]' 
                    : 'z-10 hover:border-white/20 hover:bg-white/[0.02]'
                }
            `}
        >
            {/* GRID HEADER */}
            {isGrid && (
                <div className="flex justify-between items-start mb-6 relative z-[80] w-full">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white font-mono text-lg font-black shadow-inner">
                        {ws.name.substring(0, 2).toUpperCase()}
                    </div>
                    
                    <div className="relative dropdown-container z-[100]">
                        <MenuTrigger 
                            isActive={isActive} 
                            onClick={(e) => setActiveMenuId(e, ws.id)} 
                        />
                        <DropdownMenu 
                            isOpen={isActive}
                            onEdit={(e) => handleAction(e, onEdit)}
                            onDuplicate={(e) => handleAction(e, onDuplicate)}
                            onDelete={(e) => handleAction(e, onDelete)}
                        />
                    </div>
                </div>
            )}

            {!isGrid && (
                <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-sm font-black font-mono text-white mr-6 relative z-10">
                    {ws.name.substring(0, 2).toUpperCase()}
                </div>
            )}

            {/* CONTENT AREA - Note the lower Z-index here */}
            <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <h3 className={`${isGrid ? 'text-2xl font-bold' : 'text-base font-semibold'} text-white truncate tracking-tight`}>
                        {ws.name}
                    </h3>
                    <button
                        type="button"
                        onClick={(e) => onToggleStar(e, ws.id)}
                        className="focus:outline-none"
                    >
                        <Star
                            size={18}
                            className={`transition-all duration-300 ${isStarred ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' : 'text-zinc-600 hover:text-yellow-400'}`}
                        />
                    </button>
                </div>
                <p className={`text-zinc-400 text-sm leading-relaxed ${isGrid ? 'line-clamp-2 mb-10' : 'truncate max-w-md'}`}>
                    {ws.description || "No description provided."}
                </p>
            </div>

            {/* LIST META & MENU */}
            {!isGrid && (
                <div className="flex items-center gap-4 sm:gap-12 ml-6 relative z-[80]">
                    <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.15em]">
                        <MetaItem icon={<Users size={14}/>} label={derivedType} />
                        <MetaItem icon={derivedAccess === 'Private' ? <Lock size={14}/> : <Globe size={14}/>} label={derivedAccess} />
                        <MetaItem icon={<Clock size={14}/>} label={lastActiveDate} isMono />
                    </div>
                    <div className="relative dropdown-container z-[100]">
                        <MenuTrigger 
                            isActive={isActive} 
                            onClick={(e) => setActiveMenuId(e, ws.id)} 
                        />
                        <DropdownMenu 
                            isOpen={isActive}
                            onEdit={(e) => handleAction(e, onEdit)}
                            onDuplicate={(e) => handleAction(e, onDuplicate)}
                            onDelete={(e) => handleAction(e, onDelete)}
                        />
                    </div>
                </div>
            )}

            {/* GRID FOOTER */}
            {isGrid && (
                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest relative z-10 w-full opacity-60">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <Users size={16} className="text-brand-primary/70" /> 
                        <span>{memberCount} Members</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400">
                        <Folder size={16} className="text-brand-primary/70" /> 
                        <span>{collectionCount} Folders</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function MenuTrigger({ isActive, onClick }) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick(e);
            }}
            className={`p-2.5 rounded-2xl transition-all duration-200 ${
                isActive 
                ? 'bg-brand-primary text-white shadow-lg scale-110' 
                : 'text-zinc-500 hover:text-white hover:bg-white/10'
            }`}
        >
            <MoreVertical size={20} />
        </button>
    );
}

/** * FINAL SOLID MENU FIX
 * Using a direct HEX background to bypass any Tailwind theme opacity variables.
 * Added ring-1 ring-black for razor-sharp edge separation.
 */
function DropdownMenu({ isOpen, onEdit, onDuplicate, onDelete }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    style={{ originX: 1, originY: 0 }}
                    className="absolute right-0 top-full mt-3 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] z-[999] overflow-hidden p-2 ring-1 ring-black/50"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                    <div className="px-3 py-2 mb-1 border-b border-white/5">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Workspace Options</span>
                    </div>
                    <MenuButton icon={<Edit3 size={16} />} label="Edit Details" onClick={onEdit} />
                    <MenuButton icon={<Copy size={16} />} label="Duplicate" onClick={onDuplicate} />
                    <div className="h-px bg-white/5 my-1 mx-2" />
                    <MenuButton 
                        icon={<Trash2 size={16} />} 
                        label="Delete Workspace" 
                        onClick={onDelete} 
                        variant="danger" 
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function MenuButton({ icon, label, onClick, variant = 'default' }) {
    const styles = variant === 'danger' 
        ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' 
        : 'text-zinc-300 hover:bg-white/5 hover:text-white';

    return (
        <button 
            onClick={onClick} 
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 text-xs font-bold tracking-wide rounded-xl transition-all duration-150 ${styles}`}
        >
            <span className={variant === 'danger' ? '' : 'text-brand-primary'}>{icon}</span>
            {label}
        </button>
    );
}

function MetaItem({ icon, label, isMono }) {
    return (
        <div className={`flex items-center gap-3 text-zinc-500 ${isMono ? 'font-mono' : ''}`}>
            <span className="text-brand-primary/60">{icon}</span>
            <span>{label}</span>
        </div>
    );
}