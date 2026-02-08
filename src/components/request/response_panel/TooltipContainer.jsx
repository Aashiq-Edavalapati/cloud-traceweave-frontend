"use client";

import { motion } from "framer-motion";

const TooltipContainer = ({ children, width = "w-auto" }) => (
  <motion.div 
    initial={{ opacity: 0, y: -8, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -8, scale: 0.95 }}
    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
    className={`absolute top-full right-0 mt-2 ${width} p-4 bg-[#0A0A0A] border border-[#252525] rounded-lg shadow-2xl z-50 backdrop-blur-xl`}
    style={{ 
      boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)'
    }}
  >
    {children}
  </motion.div>
);

export default TooltipContainer;