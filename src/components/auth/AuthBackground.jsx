'use client';

export default function AuthBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-bg-base">
      
      {/* 1. Spotlight Effect (Subtle glow in the center to highlight the form) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(40,40,40,1)_0%,_rgba(21,21,21,1)_80%)]" />

      {/* 2. The Grid Pattern (CRISPER NOW) 
          - Changed opacity from 0.03 to 0.07 
          - Changed color to #E5E5E5 (Lighter gray)
      */}
      <div 
        className="absolute inset-0 opacity-[0.07]" 
        style={{ 
          backgroundImage: 'linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(90deg, #E5E5E5 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} 
      />

      {/* 3. Abstract "Trace" Lines (MORE VIBRANT) */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id="trace-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="var(--brand-orange)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          
          <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="var(--brand-blue)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        
        {/* Large sweeping trace (Orange) - Increased opacity to 0.4 */}
        <path 
            d="M-100,500 Q400,300 800,800 T1800,600" 
            fill="none" 
            stroke="url(#trace-gradient)" 
            strokeWidth="2" 
            className="opacity-40 animate-pulse" 
            style={{ animationDuration: '6s' }} 
        />
        
        {/* Secondary Trace (Blue dashed) - Increased opacity to 0.2 */}
        <path 
            d="M200,0 Q500,600 200,900" 
            fill="none" 
            stroke="url(#blue-gradient)" 
            strokeWidth="1.5" 
            strokeDasharray="8 8" 
            className="opacity-20" 
        />
      </svg>
      
      {/* 4. Floating Nodes (Active endpoints) */}
      {/* Top Left Node */}
      <div className="absolute top-[20%] left-[15%] w-1.5 h-1.5 bg-brand-orange rounded-full shadow-[0_0_10px_var(--brand-orange)] animate-ping" style={{ animationDuration: '4s' }} />
      
      {/* Bottom Right Node */}
      <div className="absolute bottom-[20%] right-[15%] w-2 h-2 bg-brand-blue rounded-full shadow-[0_0_15px_var(--brand-blue)] animate-bounce" style={{ animationDuration: '8s' }} />

    </div>
  );
}