'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Github, Code2 } from 'lucide-react';

export const LandingFooter = () => {
  return (
    <footer className="border-t border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl py-20">
      <div className="max-w-[1600px] mx-auto px-8">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <Image src="/logo.png" alt="Trace-weave" width={32} height={32} className="brightness-110" />
              <span className="font-bold text-xl text-white font-mono">TRACE–WEAVE</span>
            </div>
            <p className="text-white/50 leading-relaxed max-w-sm mb-6">
              Next-generation distributed tracing for modern microservices architectures.
            </p>
            <div className="flex items-center gap-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 border border-white/20 rounded flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all backdrop-blur-sm"
              >
                <Github size={18} />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 border border-white/20 rounded flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all backdrop-blur-sm"
              >
                <Code2 size={18} />
              </motion.a>
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-2">
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><a href="#" className="hover:text-brand-primary transition-colors">Platform</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Changelog</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Roadmap</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Developers</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><a href="#" className="hover:text-brand-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">SDKs</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">GitHub</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><a href="#" className="hover:text-brand-primary transition-colors">About</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-white/30 font-mono">
            © 2026 Trace-weave Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
            <motion.div
              className="w-1.5 h-1.5 bg-green-500 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>All systems operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
