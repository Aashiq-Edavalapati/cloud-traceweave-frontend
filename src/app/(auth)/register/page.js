'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Github, Zap } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { useAuthStore } from '@/store/useAuthStore';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    };

    const handleGithubLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        <div className="glass-strong rounded-3xl overflow-hidden shadow-[0_0_50px_-12px_rgba(157,90,229,0.3)] border border-white/10 relative grain-texture">
            <div className="p-10 pb-4 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface/50 border border-brand-primary/20 mb-6 group relative">
                    <div className="absolute inset-0 bg-brand-primary/10 rounded-2xl blur-xl group-hover:bg-brand-primary/20 transition-all" />
                    <Zap size={32} className="text-brand-primary relative z-10 fill-brand-primary/20" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-2 font-mono italic">CREATE ACCOUNT</h1>
                <p className="text-sm text-text-secondary tracking-wide">
                    Join the distributed tracing engineering community.
                </p>
            </div>

            <div className="p-10 pt-6 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleGoogleLogin} type="button" className="flex items-center justify-center gap-3 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-white text-sm font-bold">
                        <FcGoogle size={20} /> GOOGLE
                    </button>
                    <button onClick={handleGithubLogin} type="button" className="flex items-center justify-center gap-3 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-white text-sm font-bold">
                        <Github size={20} /> GITHUB
                    </button>
                </div>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                    <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-[0.2em]"><span className="bg-transparent px-4 text-text-muted">Or register with email</span></div>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl text-center font-medium"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1 text-text-muted group-focus-within:text-brand-primary transition-colors h-full w-5" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:border-brand-primary/50 focus:bg-white/10 text-white placeholder:text-text-muted/50 transition-all text-sm font-medium"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1 text-text-muted group-focus-within:text-brand-primary transition-colors h-full w-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:border-brand-primary/50 focus:bg-white/10 text-white placeholder:text-text-muted/50 transition-all text-sm font-medium"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1 text-text-muted group-focus-within:text-brand-primary transition-colors h-full w-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:border-brand-primary/50 focus:bg-white/10 text-white placeholder:text-text-muted/50 transition-all text-sm font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-brand-primary text-brand-surface font-black rounded-xl transition-all hover-glow active:scale-[0.98] text-base uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? 'CREATING...' : 'GET STARTED'}
                    </button>
                </form>
            </div>

            <div className="px-10 py-6 bg-white/5 border-t border-white/5 text-center">
                <p className="text-sm text-text-secondary">
                    Already have an account?{' '}
                    <Link href="/login" className="text-brand-primary hover:text-white font-bold transition-colors underline-offset-4 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
