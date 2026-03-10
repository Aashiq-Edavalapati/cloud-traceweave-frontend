'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, BarChart3, BookOpen, FileText, Globe, HelpCircle, 
         Keyboard, MessageSquare, Network, TestTube, Terminal, Users, LayoutDashboard 
} from 'lucide-react';

export const Sidebar = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const helpRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setIsHelpOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mainNavItems = [
    { id: 'workspaces', label: 'Workspaces', icon: Network, href: '/workspace' },
    { id: 'traces', label: 'Traces', icon: Activity, href: '/traces' },
    { id: 'environments', label: 'Environments', icon: Globe, href: '/environments' },
    { id: 'monitors', label: 'Monitors', icon: TestTube, href: '/monitors' },
    { id: 'reports', label: 'Reports', icon: BarChart3, href: '/reports' },
    { id: 'team', label: 'Team', icon: Users, href: '/team' },
  ];

  // The home route is exactly '/' (or perhaps '/dashboard' depending on your setup)
  const isHomeActive = pathname === '/';

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-6 space-y-8">
        
        {/* THE COMMAND CENTER (INNOVATIVE HOME BUTTON) */}
        <div className="px-1">
          <Link
            href="/"
            className={`relative overflow-hidden group flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-300 ${
              isHomeActive
                ? 'bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 border border-brand-primary/30 shadow-[0_0_20px_rgba(157,90,229,0.15)]'
                : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 hover:shadow-lg'
            }`}
          >
            {/* Animated background flare for active state */}
            {isHomeActive && (
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-brand-primary/10 to-transparent opacity-50 pointer-events-none" />
            )}
            
            {/* Icon Wrapper */}
            <div className={`p-2 rounded-xl transition-all duration-300 relative z-10 ${
              isHomeActive 
                ? 'bg-brand-primary/20 text-brand-primary shadow-inner' 
                : 'bg-white/5 text-text-muted group-hover:text-text-secondary group-hover:scale-105'
            }`}>
              <LayoutDashboard size={18} />
            </div>
            
            {/* Text Content */}
            <div className="flex flex-col relative z-10">
              <span className={`text-[14px] font-bold tracking-wide transition-colors ${
                isHomeActive ? 'text-brand-primary' : 'text-text-secondary group-hover:text-text-primary'
              }`}>
                Overview
              </span>
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
                Home Dashboard
              </span>
            </div>
          </Link>
        </div>

        {/* Core Platform Group */}
        <div>
          <p className="px-3 mb-3 text-[10px] font-black text-text-muted uppercase tracking-[0.15em]">
            Core Platform
          </p>
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`group relative flex items-center justify-between px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-brand-primary/10 text-brand-primary' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <item.icon 
                      size={18} 
                      className={`transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-secondary'}`} 
                    />
                    {item.label}
                  </div>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavDot"
                      className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(157,90,229,0.8)]" 
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 2. Bottom Actions (Help) */}
      <div className="p-3 border-t border-border-subtle relative" ref={helpRef}>
        <AnimatePresence>
          {isHelpOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-[calc(100%+8px)] left-3 right-3 bg-[#1A1A1A] border border-border-strong rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
            >
              <div className="p-3 border-b border-border-subtle">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.1em] mb-2 px-2">Support</p>
                <Link href="/docs" className="flex items-center gap-3 px-2 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors">
                  <BookOpen size={16} className="text-text-muted" /> Documentation
                </Link>
                <Link href="/api-docs" className="flex items-center gap-3 px-2 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors">
                  <FileText size={16} className="text-text-muted" /> API Reference
                </Link>
                <a href="https://discord.gg/traceweave" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-2 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors">
                  <MessageSquare size={16} className="text-text-muted" /> Join Community
                </a>
              </div>

              <div className="p-3 bg-[#111]">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.1em] mb-2 px-2">Tools</p>
                <button className="w-full flex items-center justify-between px-2 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors text-left group">
                  <span className="flex items-center gap-3"><Terminal size={16} className="text-text-muted group-hover:text-text-secondary transition-colors" /> Download CLI</span>
                </button>
                <button className="w-full flex items-center justify-between px-2 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors text-left group">
                  <span className="flex items-center gap-3"><Keyboard size={16} className="text-text-muted group-hover:text-text-secondary transition-colors" /> Shortcuts</span>
                  <span className="text-[10px] bg-bg-base border border-border-subtle px-1.5 py-0.5 rounded-md text-text-muted font-mono">?</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          className={`group flex items-center justify-between w-full px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 ${
            isHelpOpen 
              ? 'bg-white/10 text-white' 
              : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <HelpCircle size={18} className={`transition-colors duration-200 ${isHelpOpen ? 'text-white' : 'text-text-muted group-hover:text-text-secondary'}`} />
            <span>Help & Resources</span>
          </div>
          {isHelpOpen && <div className="w-1.5 h-1.5 bg-text-primary rounded-full shadow-glow-sm" />}
        </button>
      </div>
    </div>
  );
};