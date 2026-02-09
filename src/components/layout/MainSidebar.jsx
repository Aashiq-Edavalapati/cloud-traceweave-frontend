'use client';
import { Layout, Clock, Box, Layers, Settings, Activity } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import logo from '@/assets/traceWeaveLogo.png';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut } from 'lucide-react';

const SIDEBAR_ITEMS = [
  { id: 'Collections', icon: Layout, view: 'runner' },
  { id: 'Monitor', icon: Activity, view: 'runner' },
  { id: 'Environments', icon: Layers, view: 'runner' },
  { id: 'History', icon: Clock, view: 'runner' },
  { id: 'APIs', icon: Box, view: 'runner' },
];

const SidebarItem = ({ id, icon: Icon, active, onClick }) => (
  <div
    onClick={onClick}
    className={`
      group flex flex-col items-center justify-center py-3 w-full cursor-pointer transition-all relative
      ${active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}
    `}
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-brand-orange rounded-r shadow-[0_0_8px_rgba(255,108,55,0.5)]" />
    )}
    <Icon size={22} strokeWidth={1.5} className="transition-transform group-hover:scale-110" />
    <span className="text-[9px] mt-1.5 font-medium tracking-wide">{id}</span>
  </div>
);

export default function MainSidebar() {
  const { activeSidebarItem, setActiveSidebarItem, setActiveView } = useAppStore();

  const handleClick = (item) => {
    setActiveSidebarItem(item.id);
    setActiveView(item.view);
  };

  return (
    <aside className="w-[72px] bg-bg-sidebar flex flex-col border-r border-border-subtle z-30 shrink-0 select-none">
      <div className="flex-1 flex flex-col items-center pt-5 gap-1">

        {/* Logo */}
        {/* <div className="w-10 h-10 mb-4 bg-gradient-to-br from-brand-orange to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
          Tw
        </div> */}
        <Image src={logo} alt="TraceWeave Logo" className="w-10 h-10 mb-4 rounded-xl" />


        {SIDEBAR_ITEMS.map(item => (
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
      <div className="pb-5 flex flex-col items-center gap-5 relative">
        <UserPopup />
        <Settings size={22} className="text-text-secondary hover:text-text-primary hover:rotate-90 transition-all duration-500 cursor-pointer" />
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popupRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:shadow-lg transition-shadow"
      >
        {user?.name?.[0] || 'U'}
      </div>

      {isOpen && (
        <div className="absolute bottom-full left-10 mb-2 w-48 bg-bg-panel border border-border-strong rounded-lg shadow-xl py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-border-subtle bg-bg-base/50">
            <p className="text-sm font-semibold text-text-primary">{user?.name || 'User'}</p>
            <p className="text-xs text-text-secondary truncate">{user?.email}</p>
          </div>
          <div className="p-1">
            <button className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-input rounded-md transition-colors flex items-center gap-2">
              <Settings size={14} /> Settings
            </button>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors flex items-center gap-2"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};