'use client';

// Import trend direction icons
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * MetricCard Component
 * Displays a single KPI metric with value, unit, trend, and icon
 *
 * Props:
 * - title: Name of the metric (e.g., Avg Latency)
 * - value: Metric value (e.g., 142)
 * - unit: Unit of measurement (e.g., ms, %)
 * - trend: Change compared to previous period (e.g., +12%, -0.4%)
 * - trendUpBad: Defines whether an upward trend is bad (default: true)
 * - icon: Icon component to visually represent the metric
 */
export const MetricCard = ({
    title,
    value,
    unit,
    trend,
    trendUpBad = true,
    icon: Icon,
}) => {

    // Check if the trend is positive (+) or negative (-)
    const isPositive = trend.startsWith('+');

    // Determine whether the trend should be treated as bad or good
    // Example: Error rate going up is bad, throughput going up is good
    const isBad = trendUpBad ? isPositive : !isPositive;

    return (
        // Card container
        <div className="flex flex-col p-6 glass-strong border border-white/5 rounded-3xl hover:border-brand-primary/30 transition-all hover:shadow-glow-sm group relative overflow-hidden">
            <div className="absolute inset-0 bg-white/[0.01] pointer-events-none" />

            {/* Title and icon section */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] italic group-hover:text-brand-primary transition-colors">
                    {title}
                </span>

                {/* Metric icon */}
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-brand-primary/10 group-hover:border-brand-primary/20 transition-all">
                    <Icon
                        size={16}
                        className="text-text-muted group-hover:text-brand-primary transition-colors"
                    />
                </div>
            </div>

            {/* Metric value and unit */}
            <div className="flex items-baseline gap-2 relative z-10">
                <span className="text-3xl font-black text-white tracking-tighter italic">
                    {value}
                </span>

                {/* Unit is optional */}
                {unit && (
                    <span className="text-xs font-black text-text-muted uppercase tracking-widest">{unit}</span>
                )}
            </div>

            {/* Trend indicator */}
            <div
                className={`mt-4 flex items-center text-[10px] font-black uppercase tracking-widest relative z-10 ${isBad ? 'text-red-400' : 'text-green-400'
                    }`}
            >
                <div className={`p-1 rounded-lg ${isBad ? 'bg-red-500/10' : 'bg-green-500/10'} mr-2`}>
                    {/* Trend direction icon */}
                    {isPositive ? (
                        <ArrowUpRight size={12} strokeWidth={3} />
                    ) : (
                        <ArrowDownRight size={12} strokeWidth={3} />
                    )}
                </div>

                {/* Trend value */}
                <span className="font-black italic">{trend}</span>

                {/* Comparison text */}
                <span className="text-text-muted ml-3 font-bold opacity-40 lowercase">
                    vs last hour
                </span>
            </div>
        </div>
    );
};
