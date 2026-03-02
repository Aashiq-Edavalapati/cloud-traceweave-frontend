'use client';

/**
 * CustomTooltip Component
 * Used as a custom tooltip for Recharts graphs
 *
 * Props:
 * - active  : Boolean indicating whether tooltip is visible
 * - payload : Data passed from the chart on hover
 * - label   : Label for the hovered data point (e.g., time)
 */
export const CustomTooltip = ({ active, payload, label }) => {

    // Render tooltip only when active and payload data exists
    if (active && payload && payload.length) {
        return (
            // Tooltip container
            <div className="glass-strong border border-white/10 p-4 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest relative overflow-hidden min-w-[140px]">
                <div className="absolute inset-0 bg-brand-primary/[0.03] pointer-events-none" />

                {/* Tooltip label (e.g., time or category) */}
                <p className="text-brand-primary mb-3 font-black italic border-b border-white/10 pb-2">
                    {label}
                </p>

                {/* Display each data entry */}
                <div className="space-y-2">
                    {payload.map((entry, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-2">
                                {/* Color indicator */}
                                <div
                                    className="w-1.5 h-1.5 rounded-full shadow-glow"
                                    style={{ backgroundColor: entry.color }}
                                />

                                {/* Metric name */}
                                <span className="text-text-muted">
                                    {entry.name}:
                                </span>
                            </div>

                            {/* Metric value */}
                            <span className="text-white font-mono opacity-90">
                                {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Return null when tooltip is not active
    return null;
};
