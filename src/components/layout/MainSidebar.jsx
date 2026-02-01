'use client';
import { Layout, Clock, Box, Layers, Settings, Activity } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import logo from '@/assets/traceWeaveLogo.png';
import Image from 'next/image';

const SIDEBAR_ITEMS = [
  { id: 'Collections', icon: Layout, view: 'runner' },
  { id: 'Monitor', icon: Activity, view: 'dashboard' },
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
      <div className="pb-5 flex flex-col items-center gap-5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-xs font-bold text-white">
          AE
        </div>
        <Settings size={22} className="text-text-secondary hover:text-text-primary hover:rotate-90 transition-all duration-500 cursor-pointer" />
      </div>
    </aside>
  );
}
