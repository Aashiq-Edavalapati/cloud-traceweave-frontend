'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import { Play, Github, Terminal, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { VideoModal } from '../VideoModal';

export const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const springConfig = { stiffness: 150, damping: 15 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    x.set(mousePosition.x);
    y.set(mousePosition.y);
  }, [mousePosition, x, y]);

  return (
    <section className="relative pt-32 pb-24 overflow-hidden min-h-[95vh] flex items-center grain-texture">

      {/* Immersive background glows */}
      <motion.div
        className="absolute top-[10%] right-[10%] w-[800px] h-[800px] bg-brand-glow/20 rounded-full blur-[150px] pointer-events-none"
        style={{ x, y }}
      />
      <motion.div
        className="absolute bottom-[10%] left-[0%] w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="max-w-[1600px] mx-auto px-8 relative z-10 w-full">

        {/* Headline + Subtext */}
        <div className="max-w-5xl mb-16">

          {/* Label */}
          <motion.div
            className="flex items-center gap-4 mb-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="h-px w-16 bg-brand-primary"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            />
            <div className="px-3 py-1 glass-strong rounded-full text-[10px] font-mono text-brand-primary uppercase tracking-[0.2em]">
              Public Beta v1.0
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            className="text-[clamp(3rem,8vw,6rem)] font-black tracking-[-0.04em] leading-[0.9] text-white mb-8 font-mono italic"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            DEBUG APIs<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-glow">BEYOND</span>{' '}
            <span className="relative inline-block">
              LIMITS
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1.5 bg-brand-primary glow-primary"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 0.8 }}
              />
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-text-secondary leading-relaxed max-w-2xl font-light tracking-wide mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Enterprise-grade distributed tracing for microservices.
            <span className="text-white"> Capture every request, replay failures, automate testing.</span>
            Experience the new era of API observability.
          </motion.p>

          {/* CTA Row */}
          <motion.div
            className="flex flex-wrap items-center gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="group relative px-10 py-5 bg-brand-primary text-brand-surface font-black text-lg rounded-full overflow-hidden flex items-center gap-2 hover-glow transition-all"
              >
                <span className="relative z-10">Start Weaving</span>
                <ArrowUpRight size={22} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <motion.div
                  className="absolute inset-0 bg-white/30"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="group px-10 py-5 glass hover:glass-strong rounded-full font-bold text-white transition-all flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-brand-surface transition-all">
                  <Play size={16} fill="currentColor" />
                </div>
                <span>Watch Product Tour</span>
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Terminal Window - Redesigned with Glassmorphism */}
        <motion.div
          className="relative mt-12"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {/* Background Decorative Element */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-glow/20 rounded-full blur-[100px] animate-pulse" />

          <motion.div
            className="relative max-w-5xl ml-auto cursor-pointer"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setIsVideoModalOpen(true)}
          >
            <div className="relative glass-strong rounded-2xl overflow-hidden shadow-2xl overflow-hidden group">
              {/* Title bar */}
              <div className="h-14 bg-white/5 backdrop-blur-3xl border-b border-white/10 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]/80" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/80" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]/80" />
                  </div>
                  <div className="h-4 w-px bg-white/10 mx-2" />
                  <div className="flex items-center gap-2 text-[12px] font-mono text-text-secondary tracking-tight">
                    <Terminal size={14} className="text-brand-primary" />
                    <span>traceweave-debugger --realtime</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-text-muted">HTTPS</div>
                  <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-text-muted">GRPC</div>
                </div>
              </div>

              {/* Pseudo video / Preview area */}
              <div className="aspect-[16/10] bg-[#050505]/80 relative overflow-hidden">
                <video
                  src="/videos/HeroSectionVideo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                />

                {/* Visual Overlays for realism */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent opacity-60" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100">
                  <div className="w-24 h-24 rounded-full glass-strong flex items-center justify-center shadow-2xl border border-white/20">
                    <div className="w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center text-brand-surface shadow-glow">
                      <Play size={32} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="absolute top-6 right-6">
                  <div className="px-4 py-2 glass-strong rounded-lg border border-white/10 flex items-center gap-3 backdrop-blur-3xl">
                    <motion.div
                      className="w-2 h-2 bg-brand-primary rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-[11px] font-mono font-bold text-white tracking-widest">LIVE TRACING</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoSrc="/videos/HeroSectionVideo.mp4"
      />
    </section>
  );
};
