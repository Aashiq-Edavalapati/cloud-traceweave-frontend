"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ToolbarButton = ({ icon: Icon, tooltip, onClick, active = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`p-1.5 rounded transition-colors ${
          active 
            ? 'bg-[#FF6C37] text-white' 
            : 'text-[#999] hover:text-[#EDEDED] hover:bg-[#1A1A1A]'
        }`}
      >
        <Icon size={14} />
      </motion.button>
      
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-[#0A0A0A] border border-[#252525] rounded text-[10px] text-[#EDEDED] whitespace-nowrap z-50 pointer-events-none"
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolbarButton;