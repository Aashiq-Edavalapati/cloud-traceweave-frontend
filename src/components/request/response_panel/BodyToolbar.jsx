"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WrapText, Search, Filter, Copy, Link2 } from "lucide-react";
import ToolbarButton from "./ToolbarButton";

const BodyToolbar = ({ onWrapToggle, onSearch, onFilter, onCopy, onCopyLink, isWrapped }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="flex items-center gap-1 bg-[#0A0A0A] border-b border-[#1A1A1A] px-3 py-2">
      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search in body..."
              className="w-full h-7 px-3 text-xs bg-[#111] border border-[#252525] rounded text-[#EDEDED] placeholder-[#666] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action Buttons */}
      <ToolbarButton 
        icon={WrapText} 
        tooltip="Word Wrap" 
        onClick={onWrapToggle}
        active={isWrapped}
      />
      <ToolbarButton 
        icon={Search} 
        tooltip="Search" 
        onClick={handleSearchToggle}
        active={showSearch}
      />
      <ToolbarButton 
        icon={Filter} 
        tooltip="Filter Response" 
        onClick={onFilter}
      />
      <div className="w-px h-4 bg-[#252525] mx-1" />
      <ToolbarButton 
        icon={Copy} 
        tooltip="Copy Body" 
        onClick={onCopy}
      />
      <ToolbarButton 
        icon={Link2} 
        tooltip="Copy Response Link" 
        onClick={onCopyLink}
      />
    </div>
  );
};

export default BodyToolbar;
