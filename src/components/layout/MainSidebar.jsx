'use client';

import { Layout, Clock, Box, Layers, Settings, Activity, LogOut, GitBranch, User } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import logo from '@/assets/traceWeaveLogo.png';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const SIDEBAR_ITEMS = [
  { id: 'Collections', icon: Layout, view: 'runner' },
  { id: 'Monitor', icon: Activity, view: 'runner' },
  { id: 'Environments', icon: Layers, view: 'runner' },
  { id: 'History', icon: Clock, view: 'runner' },
  { id: 'Workflows', icon: GitBranch, view: 'workflow' },
  { id: 'APIs', icon: Box, view: 'runner' },
];

export default function MainSidebar() {
  const router = useRouter();
  const { workspaceId } = useParams();
  const { activeSidebarItem, setActiveSidebarItem, setActiveView } = useAppStore();

  // NEW: State to track which item is hovered and where it is on the screen
  const [hoveredData, setHoveredData] = useState(null);

  const handleClick = (item) => {
    setActiveSidebarItem(item.id);
    setActiveView(item.view);
    router.push(`/workspace/${workspaceId}/${item.id.toLowerCase()}`);
  };

  return (
    <aside className="w-24 h-dvh glass-strong flex flex-col border-r border-white/10 z-30 shrink-0 select-none glass-morphism relative">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />

      {/* 1. TOP SECTION */}
      <div className="flex flex-col items-center pt-8 pb-2 relative z-10 shrink-0">
        <motion.div whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.5 }}>
          <Image src={logo} alt="TraceWeave Logo" className="w-10 h-10 rounded-2xl shadow-glow border border-white/10" />
        </motion.div>
      </div>

      {/* 2. MIDDLE SECTION */}
      <div className="flex-1 overflow-y-auto no-scrollbar mask-fade py-8 flex flex-col items-center gap-2 relative z-10">
        {SIDEBAR_ITEMS.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            active={activeSidebarItem === item.id}
            onClick={() => handleClick(item)}
            onHover={(rect) => setHoveredData({ label: item.id, rect })}
            onLeave={() => setHoveredData(null)}
          />
        ))}
      </div>

      {/* 3. BOTTOM SECTION */}
      <div className="mt-auto flex flex-col items-center gap-8 pb-10 relative z-10 shrink-0">
        <UserPopup
          onHover={(rect) => setHoveredData({ label: 'Profile', rect })}
          onLeave={() => setHoveredData(null)}
        />

        <div
          className="relative flex justify-center"
          onMouseEnter={(e) => setHoveredData({ label: 'Workspace Settings', rect: e.currentTarget.getBoundingClientRect() })}
          onMouseLeave={() => setHoveredData(null)}
        >
          <motion.div
            whileHover={{ rotate: 90, scale: 1.1 }}
            transition={{ duration: 0.4 }}
            onClick={() => {
              setActiveSidebarItem('Settings');
              setActiveView('settings');
              router.push(`/workspace/${workspaceId}/settings`);
            }}
          >
            <Settings size={22} className={`cursor-pointer transition-colors ${activeSidebarItem === 'Settings' ? 'text-brand-primary' : 'text-text-muted hover:text-white'}`} />
          </motion.div>
        </div>
      </div>

      {/* 4. THE MASTER TOOLTIP (Rendered outside the scroll containers) */}
      <AnimatePresence>
        {hoveredData && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            style={{
              position: 'fixed',
              top: hoveredData.rect.top + hoveredData.rect.height / 2,
              left: hoveredData.rect.right + 12,
              transform: 'translateY(-50%)'
            }}
            className="px-3 py-1.5 glass-strong border border-white/10 rounded-lg shadow-2xl z-[999] pointer-events-none whitespace-nowrap"
          >
            <p className="text-[10px] font-black tracking-widest text-brand-primary uppercase">
              {hoveredData.label}
            </p>
            {/* Tooltip Arrow */}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#0E0C16] border-l border-b border-white/10 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

const SidebarItem = ({ item, active, onClick, onHover, onLeave }) => {
  const itemRef = useRef(null);

  return (
    <div
      ref={itemRef}
      className="relative w-full flex justify-center"
      onMouseEnter={() => onHover(itemRef.current.getBoundingClientRect())}
      onMouseLeave={onLeave}
    >
      <motion.div
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          group flex flex-col items-center justify-center py-3 w-full cursor-pointer transition-all relative
          ${active ? 'text-brand-primary' : 'text-text-muted hover:text-white'}
        `}
      >
        {active && (
          <>
            <motion.div
              layoutId="activeSideIndicator"
              className="absolute left-0 top-[20%] bottom-[20%] w-1 bg-brand-primary rounded-r-full shadow-glow"
            />
            <div className="absolute inset-0 bg-brand-primary/5 blur-xl pointer-events-none" />
          </>
        )}

        <div
          className={`p-2 rounded-xl transition-all duration-300 ${active
              ? 'bg-brand-primary/10 flex items-center justify-center relative translate-x-1 shadow-[0_0_20px_rgba(234,194,255,0.15)]'
              : 'group-hover:bg-white/5 flex items-center justify-center'
            }`}
        >
          <item.icon
            size={20}
            className="transition-transform group-hover:rotate-3"
            strokeWidth={active ? 2.5 : 2}
          />
        </div>

        <span className={`text-[8px] mt-2 font-black tracking-[0.05em] uppercase transition-opacity duration-200 ${active ? 'opacity-100 text-brand-primary' : 'opacity-70 group-hover:opacity-100'
          }`}>
          {item.id}
        </span>
      </motion.div>
    </div>
  );
};

const UserPopup = ({ onHover, onLeave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex justify-center w-full" ref={popupRef}>
      <motion.div
        onMouseEnter={() => onHover(popupRef.current.getBoundingClientRect())}
        onMouseLeave={onLeave}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-primary/40 to-brand-glow/40 p-[1px] cursor-pointer hover:shadow-glow transition-all"
      >
        <div className="w-full h-full rounded-2xl bg-bg-base flex items-center justify-center text-xs font-black text-white overflow-hidden shrink-0">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            user?.fullName?.[0] + (user?.fullName?.split(' ')[1]?.[0] || '') || 'U'
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            className="absolute bottom-0 left-16 w-56 glass-strong border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/5 bg-white/5">
              <p className="text-xs font-black text-brand-primary uppercase tracking-widest mb-1 italic">DEVELOPER CONSOLE</p>
              <p className="text-sm font-bold text-white truncate">{user?.fullName || 'User'}</p>
              <p className="text-[10px] text-text-muted truncate font-mono">{user?.email}</p>
            </div>
            <div className="p-2 space-y-1">
              <Link href="/profile" className="w-full text-left px-3 py-2.5 text-xs font-bold text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center gap-3">
                <User size={14} className="text-brand-primary" /> Profile
              </Link>
              <button onClick={logout} className="w-full text-left px-3 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-3">
                <LogOut size={14} /> SYSTEM LOGOUT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};