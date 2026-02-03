'use client';

import Link from 'next/link';
import { Mail, Lock, Github, Chrome, Zap } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="bg-bg-panel border border-border-subtle rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-8 space-y-8">
        
        {/* Branding Header */}
        <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-bg-base border border-border-subtle mb-2 shadow-inner">
                <Zap size={24} className="text-brand-orange fill-brand-orange" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">TraceWeave</h1>
            <p className="text-sm text-text-secondary">
                Sign in to your workspace
            </p>
        </div>

        {/* Social Auth */}
        <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-border-subtle bg-bg-input hover:bg-bg-base hover:border-text-secondary transition-all text-text-primary text-sm font-medium">
                <Chrome size={18} /> Google
            </button>
            <button className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-border-subtle bg-bg-input hover:bg-bg-base hover:border-text-secondary transition-all text-text-primary text-sm font-medium">
                <Github size={18} /> GitHub
            </button>
        </div>

        {/* Divider */}
        <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border-subtle"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-bg-panel px-2 text-text-muted">Or continue with</span></div>
        </div>

        {/* Form */}
        <form className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email</label>
                <div className="relative group">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-text-muted group-focus-within:text-brand-orange transition-colors" />
                    <input 
                        type="email" 
                        className="w-full pl-10 pr-4 py-2.5 bg-bg-input border border-border-subtle rounded-lg focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-text-primary placeholder:text-muted transition-all text-sm"
                        placeholder="name@company.com"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Password</label>
                    <a href="#" className="text-xs text-brand-orange hover:text-orange-400 transition-colors">Forgot?</a>
                </div>
                <div className="relative group">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-text-muted group-focus-within:text-brand-orange transition-colors" />
                    <input 
                        type="password" 
                        className="w-full pl-10 pr-4 py-2.5 bg-bg-input border border-border-subtle rounded-lg focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-text-primary placeholder:text-muted transition-all text-sm"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button 
                type="button" 
                className="w-full py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-semibold rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(255,108,55,0.5)] hover:shadow-[0_0_25px_-5px_rgba(255,108,55,0.6)] text-sm"
            >
                Sign In
            </button>
        </form>
      </div>

      {/* Footer Area inside Card */}
      <div className="px-8 py-4 bg-bg-base border-t border-border-subtle text-center">
        <p className="text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-orange hover:underline font-medium">
                Sign up
            </Link>
        </p>
      </div>
    </div>
  );
}