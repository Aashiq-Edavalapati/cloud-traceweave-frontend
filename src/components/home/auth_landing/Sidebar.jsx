'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, BarChart3, BookOpen, FileText, Globe, HelpCircle, 
         Keyboard, MessageSquare, Network, TestTube, Terminal, Users 
} from 'lucide-react';

export const Sidebar = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const helpRef = useRef(null);

  // Close help on click outside
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

  return (
    <div className="flex flex-col h-full">
      {/* 1. Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-1">
        {mainNavItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-[13px] rounded-md transition-colors text-text-secondary hover:text-text-primary hover:bg-white/5"
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 2. Bottom Actions (Help) */}
      <div className="p-3 border-t border-border-subtle relative" ref={helpRef}>
        
        {/* HELP POPOVER MENU */}
        <AnimatePresence>
          {isHelpOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-[calc(100%+8px)] left-3 right-3 bg-[#1A1A1A] border border-border-strong rounded-lg shadow-2xl overflow-hidden z-50 flex flex-col"
            >
              <div className="p-3 border-b border-border-subtle">
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 px-2">Support</p>
                <Link href="/docs" className="flex items-center gap-3 px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded transition-colors">
                  <BookOpen size={14} /> Documentation
                </Link>
                <Link href="/api-docs" className="flex items-center gap-3 px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded transition-colors">
                  <FileText size={14} /> API Reference
                </Link>
                <a href="https://discord.gg/traceweave" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded transition-colors">
                  <MessageSquare size={14} /> Join Community
                </a>
              </div>

              <div className="p-3 bg-[#111]">
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 px-2">Tools</p>
                <button className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded transition-colors text-left group">
                  <span className="flex items-center gap-3"><Terminal size={14} /> Download CLI</span>
                </button>
                <button className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded transition-colors text-left">
                  <span className="flex items-center gap-3"><Keyboard size={14} /> Shortcuts</span>
                  <span className="text-[10px] bg-bg-base border border-border-subtle px-1 rounded text-text-muted">?</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HELP TRIGGER BUTTON */}
        <button
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          className={`flex items-center justify-between w-full px-3 py-2 text-[13px] rounded-md transition-all ${isHelpOpen ? 'bg-white/10 text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
        >
          <div className="flex items-center gap-3">
            <HelpCircle size={16} />
            <span>Help & Resources</span>
          </div>
          {isHelpOpen && <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />}
        </button>
      </div>
    </div>
  );
};
