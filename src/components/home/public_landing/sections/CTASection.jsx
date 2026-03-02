'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-primary/5 to-transparent" />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[150px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="max-w-[1200px] mx-auto px-8 relative z-10 text-center">
        <motion.h2
          className="text-6xl font-black tracking-tight text-white mb-6 font-mono"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          START WEAVING TODAY
        </motion.h2>
        <motion.p
          className="text-xl text-white/60 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Join engineering teams at Stripe, Databricks, and Coinbase. Deploy in under 60 seconds.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/login"
              className="group relative px-7 py-3 bg-brand-primary text-brand-surface font-bold text-lg rounded overflow-hidden flex items-center gap-3"
            >
              <span className="relative z-10">Get Started Free</span>
              <ArrowUpRight size={24} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="#docs"
              className="px-7 py-4 border-2 border-white/20 backdrop-blur-sm rounded font-semibold text-white hover:border-white/40 hover:bg-white/5 transition-all"
            >
              View Documentation
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-12 text-sm text-white/40 font-mono"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          No credit card required • 14-day trial • Cancel anytime
        </motion.div>
      </div>
    </section>
  );
};
