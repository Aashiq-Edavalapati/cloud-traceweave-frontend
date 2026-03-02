'use client';

export default function AuthIllustration() {
  return (
    <div className="relative h-full w-full bg-bg-base overflow-hidden flex items-center justify-center">
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--color-bg-panel)_0%,_var(--color-bg-base)_50%)]" />
      
      {/* Abstract Network Grid */}
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#454545 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      {/* The "Trace" Visual - Central Node */}
      <div className="relative z-10 text-center space-y-6 max-w-lg px-8">
        <div className="relative w-48 h-48 mx-auto animate-pulse">
            {/* Inner Glow */}
            <div className="absolute inset-0 rounded-full bg-brand-primary blur-3xl opacity-20"></div>
            
            <svg viewBox="0 0 200 200" className="w-full h-full stroke-brand-primary fill-none" strokeWidth="2">
                {/* Central Hub */}
                <circle cx="100" cy="100" r="20" className="fill-bg-base stroke-brand-primary" />
                
                {/* Orbiting Nodes (Static representation of a distributed system) */}
                <circle cx="100" cy="40" r="5" className="fill-brand-primary" />
                <path d="M100 80 L100 45" className="opacity-50" />
                
                <circle cx="160" cy="100" r="5" className="fill-brand-blue" />
                <path d="M120 100 L155 100" className="opacity-50 stroke-brand-blue" />
                
                <circle cx="40" cy="130" r="5" className="fill-text-secondary" />
                <path d="M85 110 L45 125" className="opacity-50 stroke-text-secondary" />
            </svg>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Debug Faster. <span className="text-brand-primary">Trace Deeper.</span>
        </h1>
        <p className="text-text-secondary text-lg">
            The unified platform for API engineering, distributed tracing, and automated scenario testing.
        </p>
      </div>
    </div>
  );
}
