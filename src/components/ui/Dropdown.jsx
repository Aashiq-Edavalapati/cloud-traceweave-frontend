'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Dropdown = ({ icon: Icon, value, options, onSelect, label, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    
    if (nextState && onOpen) {
      onOpen();
    }
  };

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-1.5 bg-bg-input hover:bg-border-subtle rounded cursor-pointer border border-transparent hover:border-border-subtle transition"
      >
        {Icon && <Icon size={14} className="text-text-secondary" />}
        <span className="text-text-primary text-xs font-semibold max-w-[100px] truncate">{value || 'Select...'}</span>
        <ChevronDown size={12} className="text-text-secondary" />
      </div>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-bg-panel border border-border-strong rounded shadow-xl py-1 z-[100]">
          <div className="px-3 py-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider border-b border-border-subtle mb-1">
            {label}
          </div>

          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-text-secondary italic">
              No {label} available
            </div>
          ) : (options.map((opt, index) => {
            // HELPER: Normalize the option (Handle String vs Object)
            const isObject = typeof opt === 'object' && opt !== null;
            const optionLabel = isObject ? opt.label : opt;
            const optionValue = isObject ? opt.value : opt;
            const optionClass = isObject ? opt.className : '';
            
            // Check if currently selected (matches the display value passed from parent)
            const isSelected = value === optionLabel;

            return (
              <div
                // Use optionValue for key to ensure uniqueness
                key={optionValue} 
                onClick={() => { onSelect(opt); setIsOpen(false); }}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between group hover:bg-brand-blue hover:text-white ${optionClass}`}
              >
                {/* Render the label, not the object */}
                <span className={optionClass ? "" : "text-text-primary group-hover:text-white"}>
                    {optionLabel}
                </span>
                
                {isSelected && <Check size={14} className={optionClass ? "text-current" : "text-brand-primary group-hover:text-white"} />}
              </div>
            );
          }))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
