"use client";

import React from 'react';
import { motion } from 'framer-motion';

const WaterfallTooltip = ({ metrics }) => {
    if (!metrics) return null;

    const dns = Number(metrics.dns) || 0;
    const tcp = Number(metrics.tcp) || 0;
    const tls = Number(metrics.tls) || 0;
    const ttfb = Number(metrics.ttfb) || 0;
    const download = Number(metrics.download) || 0;
    const total = Number(metrics.total) || 1;

    // Calculate starts and widths for waterfall blocks
    const segments = [
        { label: 'DNS Lookup', value: dns, color: 'bg-blue-500', start: 0 },
        { label: 'TCP Connection', value: tcp, color: 'bg-orange-500', start: dns },
        { label: 'SSL Handshake', value: tls, color: 'bg-purple-500', start: dns + tcp },
        { label: 'TTFB', value: ttfb, color: 'bg-green-500', start: dns + tcp + tls },
        { label: 'Downloading', value: download, color: 'bg-cyan-500', start: dns + tcp + tls + ttfb },
    ].filter(s => s.value > 0);

    return (
        <div className="w-64 p-4 bg-[#0A0A0A] border border-[#252525] rounded-lg shadow-2xl backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#1F1F1F]">
                <span className="font-semibold text-xs text-[#EDEDED] tracking-wide uppercase">Timing Metrics</span>
                <span className="text-xs font-mono font-bold text-[#FF6C37]">{total} ms</span>
            </div>

            <div className="space-y-3">
                {segments.map((seg, idx) => (
                    <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[10px]">
                            <span className="text-[#999]">{seg.label}</span>
                            <span className="text-[#EDEDED] font-mono">{seg.value} ms</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#151515] rounded-full overflow-hidden relative">
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: `${(seg.value / (total || 1)) * 100}%`, opacity: 1 }}
                                transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                                className={`h-full ${seg.color} rounded-full absolute`}
                                style={{ left: `${(seg.start / (total || 1)) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#1F1F1F]">
                <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#666]">TOTAL TRIP</span>
                    <span className="text-[#EDEDED] font-mono font-bold">{total} ms</span>
                </div>
            </div>
        </div>
    );
};

export default WaterfallTooltip;
