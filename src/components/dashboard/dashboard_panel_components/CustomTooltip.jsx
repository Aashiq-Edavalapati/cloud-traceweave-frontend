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
            <div className="bg-[#111] border border-[#333] p-3 rounded shadow-xl text-xs">

                {/* Tooltip label (e.g., time or category) */}
                <p className="text-[#888] mb-2 font-mono">
                    {label}
                </p>

                {/* Display each data entry */}
                {payload.map((entry, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 mb-1"
                    >
                        {/* Color indicator */}
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />

                        {/* Metric name */}
                        <span className="text-[#CCC]">
                            {entry.name}:
                        </span>

                        {/* Metric value */}
                        <span className="font-mono text-white">
                            {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    // Return null when tooltip is not active
    return null;
};
