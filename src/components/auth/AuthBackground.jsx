'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function AuthBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-bg-base">

      {/* 1. Immersive Spotlight Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(26,16,37,1)_0%,_rgba(8,8,10,1)_100%)]" />

      {/* 2. Sophisticated Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(rgba(234,194,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(234,194,255,0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* 3. Branded Trace Lines */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id="trace-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="var(--brand-primary)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Animated Background Traces */}
        <motion.path
          d="M-200,400 Q400,200 800,700 T1800,500"
          fill="none"
          stroke="url(#trace-gradient)"
          strokeWidth="1.5"
          className="opacity-20"
          animate={{
            d: [
              "M-200,400 Q400,200 800,700 T1800,500",
              "M-200,500 Q400,300 800,600 T1800,400",
              "M-200,400 Q400,200 800,700 T1800,500"
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* 4. Glass Glare / Glows */}
      <div className="absolute top-[30%] left-[10%] w-[400px] h-[400px] bg-brand-glow/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />

    </div>
  );
}
