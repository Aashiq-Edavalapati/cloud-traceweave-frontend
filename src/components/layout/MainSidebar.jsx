'use client';

import { Layout, Clock, Box, Layers, Settings, Activity, LogOut } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import logo from '@/assets/traceWeaveLogo.png';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

const SIDEBAR_ITEMS = [
  { id: 'Collections', icon: Layout, view: 'runner' },
  { id: 'Monitor', icon: Activity, view: 'runner' },
  { id: 'Environments', icon: Layers, view: 'runner' },
  { id: 'History', icon: Clock, view: 'runner' },
  { id: 'APIs', icon: Box, view: 'runner' },
];

const SidebarItem = ({ id, icon: Icon, active, onClick }) => (
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
      <Icon
        size={20}
        className="transition-transform group-hover:rotate-3"
        strokeWidth={active ? 2.5 : 2}
      />
    </div>

    <span
      className={`text-[8px] mt-2 font-black tracking-[0.05em] uppercase ${active
          ? 'opacity-100 text-brand-primary'
          : 'opacity-40 group-hover:opacity-100'
        }`}
    >
      {id}
    </span>
  </motion.div >
);

export default function MainSidebar() {
  const router = useRouter();
  const { workspaceId } = useParams();

  const { activeSidebarItem, setActiveView } = useAppStore();

  const handleClick = (item) => {
    // 1️⃣ Update view in Zustand (UI state only)
    setActiveView(item.view);

    // 2️⃣ Update URL (SOURCE OF TRUTH)
    router.push(`/workspace/${workspaceId}/${item.id.toLowerCase()}`);
  };

  return (
    <aside className="w-24 glass-strong flex flex-col border-r border-white/10 z-30 shrink-0 select-none glass-morphism relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />

      <div className="flex-1 flex flex-col items-center pt-8 gap-2 relative z-10">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Image
            src={logo}
            alt="TraceWeave Logo"
            className="w-10 h-10 rounded-2xl shadow-glow border border-white/10"
          />
        </motion.div>

        {SIDEBAR_ITEMS.map((item) => (
          <SidebarItem
            key={item.id}
            id={item.id}
            icon={item.icon}
            active={activeSidebarItem === item.id}
            onClick={() => handleClick(item)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="pb-8 flex flex-col items-center gap-6 relative z-10">
        <UserPopup />

        <motion.div whileHover={{ rotate: 90, scale: 1.1 }} transition={{ duration: 0.4 }}>
          <Settings
            size={22}
            className="text-text-muted hover:text-white cursor-pointer transition-colors"
          />
        </motion.div>
      </div>
    </aside>
  );
}

const UserPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popupRef}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-primary/40 to-brand-glow/40 p-[1px] cursor-pointer hover:shadow-glow transition-all"
      >
        <div className="w-full h-full rounded-2xl bg-bg-base flex items-center justify-center text-xs font-black text-white">
          {user?.fullName?.[0] +
            (user?.fullName?.split(' ')[1]?.[0] || '') ||
            'U'}
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
              <p className="text-xs font-black text-brand-primary uppercase tracking-widest mb-1 italic">
                DEVELOPER CONSOLE
              </p>
              <p className="text-sm font-bold text-white truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-[10px] text-text-muted truncate font-mono">
                {user?.email}
              </p>
            </div>

            <div className="p-2 space-y-1">
              <button className="w-full text-left px-3 py-2.5 text-xs font-bold text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center gap-3">
                <Settings size={14} className="text-brand-primary" /> USER SETTINGS
              </button>

              <button
                onClick={logout}
                className="w-full text-left px-3 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-3"
              >
                <LogOut size={14} /> SYSTEM LOGOUT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};