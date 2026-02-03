'use client';

export default function AuthCard({ children, title, subtitle, icon: Icon }) {
  return (
    <div className="relative group">
        {/* Subtle Glow behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange to-brand-blue rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        
        {/* The Card Itself */}
        <div className="relative bg-bg-panel/80 backdrop-blur-xl border border-border-subtle rounded-xl shadow-2xl overflow-hidden p-8 w-full max-w-[420px]">
            
            {/* Header Section */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-bg-base border border-border-subtle mb-4 shadow-inner">
                    {Icon && <Icon size={24} className="text-brand-orange" />}
                </div>
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
                <p className="text-sm text-text-secondary mt-2">
                    {subtitle}
                </p>
            </div>

            {/* Content (Forms) */}
            {children}
        </div>
    </div>
  );
}