'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Github, Zap, Check, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { useAuthStore } from '@/store/useAuthStore';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuthStore();

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // UI States
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [strength, setStrength] = useState({ score: 0, label: '', color: 'bg-white/10' });

    // Real-time Password Validation
    useEffect(() => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const config = [
            { label: 'Too Short', color: 'bg-red-500' },
            { label: 'Weak', color: 'bg-orange-500' },
            { label: 'Fair', color: 'bg-yellow-500' },
            { label: 'Good', color: 'bg-blue-500' },
            { label: 'Excellent', color: 'bg-emerald-500' }
        ];

        setStrength({ 
            score, 
            label: password ? config[score].label : '', 
            color: password ? config[score].color : 'bg-white/10' 
        });
    }, [password]);

    const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isFormValid = name.length > 2 && isEmailValid(email) && strength.score >= 2;

    const handleGoogleLogin = () => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    const handleGithubLogin = () => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;
        setError('');
        setLoading(true);

        try {
            await register({ name, email, password });
            router.push('/workspace');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-strong rounded-3xl overflow-hidden shadow-[0_0_50px_-12px_rgba(157,90,229,0.3)] border border-white/10 relative grain-texture max-w-lg mx-auto">
            <div className="p-10 pb-4 text-center">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface/50 border border-brand-primary/20 mb-6 group relative"
                >
                    <div className="absolute inset-0 bg-brand-primary/10 rounded-2xl blur-xl group-hover:bg-brand-primary/20 transition-all" />
                    <Zap size={32} className="text-brand-primary relative z-10 fill-brand-primary/20" />
                </motion.div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-2 font-mono italic">CREATE ACCOUNT</h1>
                <p className="text-sm text-text-secondary tracking-wide">
                    Join the distributed tracing engineering community.
                </p>
            </div>

            <div className="p-10 pt-6 space-y-7">
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleGoogleLogin} type="button" className="flex items-center justify-center gap-3 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-white text-[11px] font-black tracking-widest">
                        <FcGoogle size={18} /> GOOGLE
                    </button>
                    <button onClick={handleGithubLogin} type="button" className="flex items-center justify-center gap-3 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-white text-[11px] font-black tracking-widest">
                        <Github size={18} /> GITHUB
                    </button>
                </div>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                    <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-[0.2em]"><span className="bg-[#121216] px-4 text-text-muted">Or secure email signup</span></div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl text-center font-bold uppercase tracking-wider"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">Full Name</label>
                            {name.length > 2 && <Check size={12} className="text-emerald-500" />}
                        </div>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors size={18}" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:border-brand-primary/50 focus:bg-white/10 text-white placeholder:text-text-muted/40 transition-all text-sm font-medium"
                                placeholder="Engineer Name"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">System Email</label>
                            {email && (isEmailValid(email) ? <Check size={12} className="text-emerald-500" /> : <X size={12} className="text-red-500" />)}
                        </div>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors size={18}" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:border-brand-primary/50 focus:bg-white/10 text-white placeholder:text-text-muted/40 transition-all text-sm font-medium"
                                placeholder="name@trace.weave"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Security Key</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors size={18}" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:border-brand-primary/50 focus:bg-white/10 text-white placeholder:text-text-muted/40 transition-all text-sm font-medium"
                                placeholder="••••••••••••"
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Visual Strength Meter */}
                        
                        <div className="pt-2 px-1">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] uppercase font-bold text-text-muted tracking-widest">Strength Status</span>
                                <span className={`text-[9px] font-black uppercase ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
                                {[...Array(4)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`h-full flex-1 transition-all duration-500 ${i < strength.score ? strength.color : 'bg-white/5'}`} 
                                    />
                                ))}
                            </div>
                            
                            {/* Requirement Checklist */}
                            <ul className="grid grid-cols-2 gap-2 mt-4">
                                {[
                                    { label: '8+ Symbols', met: password.length >= 8 },
                                    { label: 'Casing Mix', met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
                                    { label: 'Includes Num', met: /[0-9]/.test(password) },
                                    { label: 'Special Char', met: /[^A-Za-z0-9]/.test(password) }
                                ].map((req, i) => (
                                    <li key={i} className={`text-[9px] flex items-center gap-2 font-bold tracking-tight transition-colors ${req.met ? 'text-emerald-400' : 'text-text-muted opacity-50'}`}>
                                        <div className={`w-1 h-1 rounded-full ${req.met ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'bg-white/20'}`} />
                                        {req.label.toUpperCase()}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className="group w-full py-4 bg-brand-primary text-brand-surface font-black rounded-xl transition-all hover-glow active:scale-[0.98] text-sm uppercase tracking-[0.2em] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>INITIALIZE ACCOUNT <Zap size={16} className="fill-current" /></>
                        )}
                    </button>
                </form>
            </div>

            <div className="px-10 py-6 bg-white/5 border-t border-white/5 text-center">
                <p className="text-xs text-text-secondary font-medium tracking-wide">
                    ALREADY REGISTERED?{' '}
                    <Link href="/login" className="text-brand-primary hover:text-white font-black transition-colors underline-offset-4 hover:underline">
                        SIGN IN
                    </Link>
                </p>
            </div>
        </div>
    );
}