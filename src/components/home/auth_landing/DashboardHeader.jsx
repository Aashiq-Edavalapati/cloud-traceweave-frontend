'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, LogOut, User, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardHeader = ({ user, logout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b border-border-subtle bg-bg-base/80 backdrop-blur-md flex items-center justify-between px-6 z-20 sticky top-0">
      {/* Search Bar */}
      <div className="w-full max-w-md">
        <button className="flex items-center gap-2 w-full px-3 py-1.5 bg-bg-input border border-border-subtle rounded-md text-sm text-text-muted hover:border-border-strong transition-colors group">
          <Search size={14} className="group-hover:text-text-primary transition-colors" />
          <span>Search workspaces, traces, or collections...</span>
          <div className="ml-auto flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-1.5 text-[10px] font-mono bg-bg-panel border border-border-subtle rounded text-text-muted">⌘K</kbd>
          </div>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="text-text-muted hover:text-text-primary transition-colors relative">
          <Bell size={18} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-primary rounded-full border-2 border-bg-base"></span>
        </button>
        
        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-border-subtle flex items-center justify-center text-xs font-medium text-white hover:ring-2 ring-border-subtle transition-all"
          >
            {user?.email?.substring(0, 2).toUpperCase() || 'ME'}
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 bg-[#1A1A1A] border border-border-strong rounded-lg shadow-xl py-1 z-50"
              >
                <div className="px-3 py-2 border-b border-border-subtle">
                  <p className="text-sm font-medium text-text-primary truncate">{user?.fullName || 'Engineer'}</p>
                  <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5">
                    <User size={14} /> Profile Settings
                  </Link>
                  <Link href="/billing" className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5">
                    <Building2 size={14} /> Billing & Plan
                  </Link>
                </div>
                <div className="py-1 border-t border-border-subtle">
                  <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
