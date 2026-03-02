'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'glass-strong py-3'
          : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-[1600px] mx-auto px-8">
        <div className="flex items-center justify-between">

          {/* Left: Logo + Status */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1, rotate: [-5, 5, 0] }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute -inset-2 bg-brand-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image src="/logo.png" alt="Trace-weave" width={34} height={34} className="brightness-110 relative z-10" />
              </motion.div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter text-white font-mono leading-none">TRACE–WEAVE</span>
                <span className="text-[9px] text-brand-primary font-mono tracking-[0.3em] font-bold mt-1 opacity-60">DISTRIBUTED DEBUGGING</span>
              </div>
            </Link>
          </div>

          {/* Center: Navigation */}
          <div className="hidden md:flex items-center gap-1 glass p-1 rounded-full border border-white/5">
            {['Platform', 'Solutions', 'Docs', 'Pricing'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`#${item.toLowerCase()}`}
                  className="px-6 py-2 text-sm font-medium text-text-secondary hover:text-white hover:bg-white/5 rounded-full transition-all duration-300"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right: CTA */}
          <motion.div
            className="flex items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/login"
              className="hidden sm:block text-sm font-bold text-text-secondary hover:text-white transition-colors tracking-wide"
            >
              LOG IN
            </Link>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/login"
                className="relative px-8 py-3 bg-brand-primary text-brand-surface text-sm font-black rounded-full
                            transition-all duration-300 ease-out hover-glow
                            hover:bg-brand-glow active:scale-[0.98]"
              >
                GO TO CONSOLE
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};
