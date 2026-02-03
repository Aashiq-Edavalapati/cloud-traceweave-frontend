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
        <div className="flex flex-col p-5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm hover:border-[#404040] transition-colors group">

            {/* Title and icon section */}
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-medium text-[#888] uppercase tracking-wider">
                    {title}
                </span>

                {/* Metric icon */}
                <Icon
                    size={16}
                    className="text-[#444] group-hover:text-[#666] transition-colors"
                />
            </div>

            {/* Metric value and unit */}
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono font-medium text-[#EDEDED]">
                    {value}
                </span>

                {/* Unit is optional */}
                {unit && (
                    <span className="text-sm text-[#666]">{unit}</span>
                )}
            </div>

            {/* Trend indicator */}
            <div
                className={`mt-2 flex items-center text-xs font-medium ${isBad ? 'text-red-400' : 'text-emerald-400'
                    }`}
            >
                {/* Trend direction icon */}
                {isPositive ? (
                    <ArrowUpRight size={14} />
                ) : (
                    <ArrowDownRight size={14} />
                )}

                {/* Trend value */}
                <span className="ml-1">{trend}</span>

                {/* Comparison text */}
                <span className="text-[#555] ml-2 font-normal">
                    vs last hr
                </span>
            </div>
        </div>
    );
};
