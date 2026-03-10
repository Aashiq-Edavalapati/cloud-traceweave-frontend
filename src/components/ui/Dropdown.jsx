'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

const Dropdown = ({ 
  icon: Icon, 
  value, 
  options, 
  onSelect, 
  label, 
  onOpen,
  enableSearch = false,
  searchPlaceholder = "Search...",
  customFooter = null,
  menuWidth = "w-56" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const ref = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear search when closed
  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && onOpen) onOpen();
  };

  const filteredOptions = options.filter(opt => {
    if (!enableSearch) return true;
    const optionLabel = typeof opt === 'object' && opt !== null ? opt.label : opt;
    return optionLabel.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <div
        onClick={handleToggle}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border transition-all duration-200
          ${isOpen 
            ? 'bg-bg-input border-brand-primary/30 ring-1 ring-brand-primary/10' 
            : 'bg-bg-input/50 border-border-subtle hover:border-brand-primary/20 hover:bg-bg-input'
          }
        `}
      >
        {Icon && <Icon size={14} className={isOpen ? "text-brand-primary" : "text-text-muted"} />}
        <span className="text-text-primary text-xs font-semibold max-w-[110px] truncate">
          {value || 'Select...'}
        </span>
        <ChevronDown 
          size={12} 
          className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-primary' : ''}`} 
        />
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`
          absolute top-full left-0 mt-2 ${menuWidth} z-[100]
          glass-strong rounded-xl shadow-2xl overflow-hidden
          animate-in fade-in zoom-in-95 duration-200 origin-top-left
          flex flex-col border border-white/[0.05]
        `}>
          {/* Header Label */}
          <div className="px-3.5 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] border-b border-white/[0.03] shrink-0 bg-white/[0.01]">
            {label}
          </div>

          {/* Search Section */}
          {enableSearch && (
            <div className="p-2 border-b border-white/[0.03] shrink-0">
              <div className="relative flex items-center">
                <Search size={12} className="absolute left-2.5 text-text-muted/60" />
                <input
                  type="text"
                  autoFocus
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-bg-base/40 text-xs text-white rounded-md py-1.5 pl-8 pr-2 border border-white/[0.05] focus:border-brand-primary/40 focus:outline-none transition-all placeholder:text-text-muted/30"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar py-1.5 px-1.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-8 text-xs text-text-muted/50 italic text-center">
                No results found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isObject = typeof opt === 'object' && opt !== null;
                const optionLabel = isObject ? opt.label : opt;
                const optionValue = isObject ? opt.value : opt;
                const isSelected = value === optionLabel;

                return (
                  <div
                    key={optionValue} 
                    onClick={() => { onSelect(opt); setIsOpen(false); }}
                    className={`
                      relative px-3 py-2 text-sm cursor-pointer flex items-center justify-between group rounded-lg transition-all duration-150 mb-0.5 last:mb-0
                      hover:bg-brand-primary/[0.08] hover:translate-x-0.5
                      ${isSelected ? 'bg-brand-primary/[0.12]' : ''}
                    `}
                  >
                    {/* Active Accent Pill */}
                    <div className={`
                      absolute left-0 w-0.5 h-4 rounded-full bg-brand-primary transition-all duration-200
                      ${isSelected ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 group-hover:opacity-50 group-hover:scale-y-75'}
                    `} />

                    <span className={`
                      text-xs transition-colors truncate pr-2 pl-1
                      ${isSelected ? 'text-brand-primary font-medium' : 'text-text-secondary group-hover:text-white'}
                    `}>
                      {optionLabel}
                    </span>
                    
                    {isSelected && (
                      <Check size={14} className="text-brand-primary shrink-0 animate-in zoom-in-50 duration-200" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {customFooter && (
            <div className="border-t border-white/[0.03] p-1 shrink-0 bg-brand-muted/20">
              <div onClick={() => setIsOpen(false)}>
                {customFooter}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;