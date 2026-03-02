'use client';

import { motion } from 'framer-motion';

export const FloatingElements = () => {
  const floatingVariants = {
    initial: { y: 0, x: 0, rotate: 0 },
    animate: (custom) => ({
      y: [0, -20, 0],
      x: [0, custom.x, 0],
      rotate: [0, custom.rotate, 0],
      transition: {
        duration: custom.duration,
        repeat: Infinity,
        ease: "easeInOut"
      }
    })
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div 
        className="absolute top-[15%] left-[8%] w-2 h-2 bg-brand-primary rounded-full opacity-60"
        variants={floatingVariants}
        custom={{ duration: 8, x: 10, rotate: 0 }}
        initial="initial"
        animate="animate"
      />
      <motion.div 
        className="absolute top-[45%] right-[12%] w-3 h-3 border border-brand-primary/40"
        variants={floatingVariants}
        custom={{ duration: 10, x: -15, rotate: 45 }}
        initial="initial"
        animate="animate"
      />
      <motion.div 
        className="absolute bottom-[25%] left-[15%] w-1.5 h-1.5 bg-brand-blue rounded-full opacity-40"
        variants={floatingVariants}
        custom={{ duration: 6, x: 8, rotate: 0 }}
        initial="initial"
        animate="animate"
      />
      <motion.div 
        className="absolute top-[60%] right-[25%] w-2.5 h-2.5 border border-brand-blue/30"
        variants={floatingVariants}
        custom={{ duration: 9, x: -12, rotate: 90 }}
        initial="initial"
        animate="animate"
      />
    </div>
  );
};
