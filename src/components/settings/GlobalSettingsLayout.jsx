'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { 
    User, Shield, Palette, Key, CreditCard, 
    ArrowLeft, Save, Loader2, Mail, Camera,
    ExternalLink, CheckCircle2, Lock, Eye, EyeOff, ShieldCheck
} from 'lucide-react';
import { uploadApi } from '@/api/upload.api';

const SETTINGS_TABS = [
    { id: 'profile', label: 'Public Profile', icon: User },
    { id: 'account', label: 'Account Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'billing', label: 'Billing', icon: CreditCard },
];

export default function GlobalSettingsLayout({ initialTab = 'profile' }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const { user, updateProfile } = useAuthStore();
    const router = useRouter();

    // Profile States
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [isSaving, setIsSaving] = useState(false);

    // Account Security States
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: 'bg-red-500' });

    // Calculate Password Strength
    useEffect(() => {
        let score = 0;
        if (newPass.length > 8) score++;
        if (/[A-Z]/.test(newPass)) score++;
        if (/[0-9]/.test(newPass)) score++;
        if (/[^A-Za-z0-9]/.test(newPass)) score++;

        const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];
        
        setStrength({ 
            score, 
            label: labels[score] || 'Weak', 
            color: colors[score] || 'bg-red-500' 
        });
    }, [newPass]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            const res = await uploadApi.uploadFile(formData);
            if (res.secure_url) await updateProfile({ avatarUrl: res.secure_url });
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setIsSaving(true);
            await updateProfile({ fullName });
        } catch (err) {
            console.error("Save failed", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-screen w-full flex flex-col bg-bg-base text-text-primary overflow-hidden">
            {/* Header */}
            <div className="h-14 border-b border-border-subtle bg-bg-panel/40 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-1.5 hover:bg-white/5 rounded-md text-text-muted hover:text-text-primary transition-all">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="h-4 w-[1px] bg-border-subtle" />
                    <span className="text-sm font-semibold tracking-tight">Settings</span>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-border-subtle bg-bg-base/50 p-6 flex flex-col gap-1 shrink-0">
                    <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 px-2">Personal</h2>
                    {SETTINGS_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                                activeTab === tab.id ? 'bg-brand-primary/10 text-brand-primary shadow-[inset_0_0_0_1px_rgba(var(--brand-primary-rgb),0.2)]' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0C0B10]">
                    <div className="max-w-5xl mx-auto p-8 lg:p-16">
                        
                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <header className="mb-10">
                                    <h1 className="text-3xl font-bold tracking-tight">Public Profile</h1>
                                    <p className="text-text-secondary mt-2">Manage your identity across the workspace.</p>
                                </header>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="bg-bg-panel border border-border-subtle rounded-2xl p-8 shadow-sm">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Full Name</label>
                                                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-bg-input border border-border-subtle rounded-xl px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Email</label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                                        <input type="email" defaultValue={user?.email} disabled className="w-full bg-bg-base/50 border border-border-subtle rounded-xl pl-11 pr-4 py-3 text-sm text-text-muted cursor-not-allowed" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-8 pt-6 border-t border-border-subtle">
                                                <button onClick={handleSaveProfile} disabled={isSaving || fullName === user?.fullName} className="flex items-center gap-2 bg-brand-primary text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-glow-sm hover:bg-brand-glow transition-all disabled:opacity-30">
                                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>

                                        {/* Status Card with Pulse Animation */}
                                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                                                    <div className="relative w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                                        <CheckCircle2 size={20} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold">Verified Professional</h4>
                                                    <p className="text-xs text-text-muted">Your identity has been confirmed via email.</p>
                                                </div>
                                            </div>
                                            <ExternalLink size={16} className="text-text-muted group-hover:text-emerald-500 cursor-pointer transition-colors" />
                                        </div>
                                    </div>

                                    {/* Avatar Card */}
                                    <div className="lg:col-span-1">
                                        <div className="bg-bg-panel border border-border-subtle rounded-2xl p-8 flex flex-col items-center shadow-sm sticky top-8">
                                            <div className="relative">
                                                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-brand-primary to-brand-glow p-1 shadow-glow-sm relative">
                                                    <div className="w-full h-full rounded-full bg-[#1E1E24] flex items-center justify-center text-4xl font-black text-white overflow-hidden">
                                                        {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : user?.fullName?.charAt(0)}
                                                    </div>
                                                    {/* Floating Badge */}
                                                    <div className="absolute -top-1 -right-1 bg-emerald-500 border-4 border-bg-panel text-white rounded-full p-1 shadow-lg animate-bounce">
                                                        <ShieldCheck size={14} />
                                                    </div>
                                                </div>
                                                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 p-2 bg-brand-primary text-black rounded-full border-4 border-bg-panel hover:scale-110 transition-all"><Camera size={16} /></button>
                                            </div>
                                            <h3 className="mt-6 font-bold text-lg">{user?.fullName}</h3>
                                            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                                            <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full mt-6 py-2.5 rounded-xl border border-border-subtle hover:bg-white/5 transition-all text-xs font-bold">
                                                {isUploading ? 'Uploading...' : 'Change Photo'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ACCOUNT SECURITY TAB */}
                        {activeTab === 'account' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <header className="mb-10">
                                    <h1 className="text-3xl font-bold tracking-tight">Account Security</h1>
                                    <p className="text-text-secondary mt-2">Manage your authentication methods and password strength.</p>
                                </header>

                                <div className="grid grid-cols-1 gap-8">
                                    <div className="bg-bg-panel border border-border-subtle rounded-2xl p-8">
                                        <div className="flex items-center gap-3 mb-8">
                                            <Lock size={20} className="text-brand-primary" />
                                            <h3 className="font-bold">Update Password</h3>
                                        </div>

                                        <div className="max-w-xl space-y-6">
                                            <div>
                                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Current Password</label>
                                                <input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="w-full bg-bg-input border border-border-subtle rounded-xl px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all" />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">New Password</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showPass ? 'text' : 'password'} 
                                                        value={newPass} 
                                                        onChange={(e) => setNewPass(e.target.value)} 
                                                        className="w-full bg-bg-input border border-border-subtle rounded-xl px-4 py-3 text-sm focus:border-brand-primary outline-none transition-all" 
                                                    />
                                                    <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>

                                                {/* Password Strength Meter */}
                                                
                                                <div className="mt-4 space-y-2">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Password Strength</span>
                                                        <span className={`text-[10px] font-black uppercase ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
                                                        {[...Array(4)].map((_, i) => (
                                                            <div 
                                                                key={i} 
                                                                className={`h-full flex-1 transition-all duration-500 rounded-full ${i < strength.score ? strength.color : 'bg-white/5'}`} 
                                                            />
                                                        ))}
                                                    </div>
                                                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
                                                        {[
                                                            { label: '8+ Characters', met: newPass.length >= 8 },
                                                            { label: 'Uppercase Letter', met: /[A-Z]/.test(newPass) },
                                                            { label: 'Include Number', met: /[0-9]/.test(newPass) },
                                                            { label: 'Special Character', met: /[^A-Za-z0-9]/.test(newPass) }
                                                        ].map((req, i) => (
                                                            <li key={i} className={`text-[10px] flex items-center gap-2 ${req.met ? 'text-emerald-500' : 'text-text-muted'}`}>
                                                                <div className={`w-1 h-1 rounded-full ${req.met ? 'bg-emerald-500' : 'bg-text-muted opacity-30'}`} />
                                                                {req.label}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/5">
                                                    Update Security Credentials
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2FA Card */}
                                    <div className="bg-bg-panel border border-border-subtle rounded-2xl p-8 flex items-center justify-between opacity-60">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                                <Shield size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Two-Factor Authentication</h4>
                                                <p className="text-xs text-text-muted">Add an extra layer of security to your account.</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 rounded-lg bg-white/5 text-xs font-bold border border-white/5">Configure</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* OTHER TABS (Placeholders) */}
                        {['appearance', 'apikeys', 'billing'].includes(activeTab) && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[50vh] flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                                    <Palette size={40} className="text-text-muted opacity-40" />
                                </div>
                                <h2 className="text-2xl font-bold">In Development</h2>
                                <p className="text-text-secondary mt-3 max-w-sm italic">This module is currently being optimized for the 2026 build.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}