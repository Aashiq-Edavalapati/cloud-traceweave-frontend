"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const WaterfallTooltip = ({ metrics }) => {
    const totalTime = metrics.total;

    const phases = [
        { label: 'Socket', time: metrics.socket, color: '#FFB800', start: 0 },
        { label: 'DNS', time: metrics.dns, color: '#FF8C00', start: metrics.socket },
        { label: 'TCP', time: metrics.tcp, color: '#0EA5E9', start: metrics.socket + metrics.dns },
        { label: 'TTFB', time: metrics.ttfb, color: '#EF4444', start: metrics.socket + metrics.dns + metrics.tcp },
        { label: 'Download', time: metrics.download, color: '#10B981', start: metrics.socket + metrics.dns + metrics.tcp + metrics.ttfb }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full right-0 mt-2 w-[90vw] sm:w-[420px] max-w-[calc(100vw-2rem)] bg-[#0A0A0A] border border-[#252525] rounded-lg shadow-2xl z-50 p-4 backdrop-blur-xl"
            style={{
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)'
            }}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#1F1F1F]">
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[#FF6C37]" />
                    <span className="font-semibold text-xs text-[#EDEDED] tracking-wide">RESPONSE TIMELINE</span>
                </div>
                <span className="text-sm font-mono font-bold text-[#FF6C37]">{totalTime.toFixed(0)} ms</span>
            </div>

            {/* Timeline Visualization */}
            <div className="space-y-2.25">
                {phases.map((phase, i) => {
                    const leftPct = (phase.start / totalTime) * 100;
                    const widthPct = Math.max((phase.time / totalTime) * 100, 0.5);

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            className="group/row"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-medium text-[#999] uppercase tracking-wider">
                                    {phase.label}
                                </span>
                                <span className="text-xs font-mono text-[#EDEDED]">{phase.time.toFixed(1)} ms</span>
                            </div>

                            <div className="h-4 relative w-full bg-[#0D0D0D] rounded-md overflow-hidden border border-[#1A1A1A]">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${widthPct}%` }}
                                    transition={{ delay: i * 0.05 + 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    className="absolute h-full top-0 rounded-sm"
                                    style={{
                                        left: `${leftPct}%`,
                                        background: `linear-gradient(90deg, ${phase.color}ee, ${phase.color})`,
                                        boxShadow: `0 0 8px ${phase.color}40`
                                    }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-3 border-t border-[#1F1F1F] flex items-center justify-between">
                <span className="text-[10px] text-[#666] uppercase tracking-wider">Total Time</span>
                <span className="text-sm font-mono font-bold text-[#FF6C37]">{totalTime.toFixed(0)} ms</span>
            </div>
        </motion.div>
    );
};

export default WaterfallTooltip;