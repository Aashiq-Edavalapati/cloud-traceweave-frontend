'use client';

import { motion } from 'framer-motion';


export const GridBackground = () => (
  <div className="fixed inset-0 pointer-events-none opacity-[0.12]">
    <motion.div 
      className="absolute inset-0" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        backgroundImage: `
          linear-gradient(rgba(157, 90, 229,0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(157, 90, 229,0.15) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px'
      }}
    />
  </div>
);
