'use client';

// React hooks
import { useState, useEffect } from 'react';

// Recharts components for graphs
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    ReferenceLine
} from 'recharts';

// Icons used in dashboard
import {
    Activity,
    AlertTriangle,
    Clock,
    Zap,
    Server
} from 'lucide-react';

// Reusable dashboard components
import { MetricCard } from './dashboard_panel_components/MetricCard';
import { CustomTooltip } from './dashboard_panel_components/CustomTooltip';


// --------------------------------------------------
// Mock Traffic Data (Hourly data for charts)
// --------------------------------------------------
const TRAFFIC_DATA = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    latency: 120 + Math.random() * 50 - (i > 18 ? 0 : 20), // Simulated latency
    requests: 2000 + Math.random() * 1000,               // Requests per hour
    errors: Math.floor(Math.random() * 20)               // Error count
}));


// --------------------------------------------------
// HTTP Status Code Distribution
// --------------------------------------------------
const ERROR_DISTRIBUTION = [
    { name: '200 OK', value: 45000, color: '#22c55e' },
    { name: '304 Not Mod', value: 12000, color: '#3b82f6' },
    { name: '400 Bad Req', value: 2300, color: '#eab308' },
    { name: '429 Rate Ltd', value: 800, color: '#f97316' },
    { name: '500 Server', value: 150, color: '#ef4444' },
];


// --------------------------------------------------
// Slowest API Endpoints (P95 latency)
// --------------------------------------------------
const ENDPOINTS = [
    { method: 'POST', path: '/v1/payments/checkout', p95: 842, status: 'error', trend: '+12%' },
    { method: 'GET', path: '/v1/users/profile', p95: 124, status: 'healthy', trend: '-2%' },
    { method: 'POST', path: '/auth/login', p95: 350, status: 'warn', trend: '+5%' },
    { method: 'GET', path: '/v1/products/list', p95: 85, status: 'healthy', trend: '0%' },
    { method: 'PUT', path: '/v1/settings/update', p95: 210, status: 'healthy', trend: '-1%' },
];


// ==================================================
// DashboardPanel Component
// ==================================================
export default function DashboardPanel() {

    // Prevents hydration issues with Recharts in Next.js
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Show loading text until component mounts
    if (!mounted) {
        return (
            <div className="p-8 text-[#444]">
                Initializing Metrics...
            </div>
        );
    }

    return (
        <div className="flex-1 h-full overflow-y-auto glass border-l border-white/5 p-8 custom-scrollbar relative">
            <div className="absolute inset-0 bg-white/[0.01] pointer-events-none" />

            {/* ================= TOP BAR ================= */}
            <div className="flex justify-between items-end mb-10 relative z-10">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter uppercase italic">
                        <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 shadow-glow-sm">
                            <Activity size={24} className="text-brand-primary" />
                        </div>
                        Performance Hub
                    </h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest border border-brand-primary/20">PRODUCTION</span>
                        <div className="h-3 w-px bg-white/10" />
                        <p className="text-[10px] text-text-muted font-black tracking-widest uppercase">us-east-1a • active clusters</p>
                    </div>
                </div>

                {/* Time range controls - Premiumized */}
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-inner">
                    {['1h', '24h', '7d', '30d'].map(range => (
                        <button
                            key={range}
                            className={`px-5 py-2 text-[10px] font-black tracking-tighter rounded-xl transition-all uppercase ${range === '24h'
                                ? 'bg-brand-primary text-brand-surface shadow-glow-sm'
                                : 'text-text-muted hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* ================= KPI CARDS ================= */}
            <div className="grid grid-cols-4 gap-6 mb-8 relative z-10">
                <MetricCard title="AVG LATENCY" value="142" unit="MS" trend="+12%" icon={Clock} />
                <MetricCard title="THROUGHPUT" value="2.4k" unit="RPM" trend="+5.2%" trendUpBad={false} icon={Zap} />
                <MetricCard title="ERROR RATE" value="0.82" unit="%" trend="-0.4%" icon={AlertTriangle} />
                <MetricCard title="NODES ACTIVE" value="14" unit="/ 16" trend="0%" trendUpBad={false} icon={Server} />
            </div>

            {/* ================= CHARTS SECTION ================= */}
            <div className="grid grid-cols-12 gap-8 h-[420px] mb-8 relative z-10">

                {/* Latency Area Chart */}
                <div className="col-span-8 glass-strong border border-white/10 rounded-3xl p-8 flex flex-col relative overflow-hidden group">
                    <div className="absolute inset-0 bg-brand-primary/[0.02] pointer-events-none" />
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] italic">
                            Operational Velocity
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-brand-primary shadow-glow" />
                                <span className="text-[10px] text-text-muted font-bold">LATENCY</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 shadow-glow" />
                                <span className="text-[10px] text-text-muted font-bold">SLA LIMIT</span>
                            </div>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={TRAFFIC_DATA}>
                            <defs>
                                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EAC2FF" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#EAC2FF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                            <RechartsTooltip content={<CustomTooltip />} />

                            <ReferenceLine y={160} stroke="#EF4444" strokeDasharray="5 5" strokeWidth={2} />

                            <Area
                                type="monotone"
                                dataKey="latency"
                                stroke="#EAC2FF"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#latencyGradient)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Status Code Bar Chart */}
                <div className="col-span-4 glass-strong border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/[0.01] pointer-events-none" />
                    <h3 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] italic mb-10">
                        Signal Integrity
                    </h3>

                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ERROR_DISTRIBUTION} layout="vertical" margin={{ left: -20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                                {ERROR_DISTRIBUTION.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ================= ENDPOINT TABLE ================= */}
            <div className="glass-strong border border-white/10 rounded-3xl overflow-hidden relative z-10">
                <div className="px-8 py-5 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] italic">
                        Anomaly Detection Protocol
                    </h3>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-white/5 bg-white/[0.01]">
                            <th className="px-8 py-4">Method</th>
                            <th className="px-8 py-4">Endpoint Path</th>
                            <th className="px-8 py-4 text-right">P95 LATENCY</th>
                            <th className="px-8 py-4 text-right">HISTORICAL TREND</th>
                            <th className="px-8 py-4 text-right">STATUS</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-bold">
                        {ENDPOINTS.map((ep, i) => (
                            <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                                <td className="px-8 py-5 text-brand-primary font-black uppercase tracking-tighter">{ep.method}</td>
                                <td className="px-8 py-5 text-white font-mono opacity-80 group-hover:opacity-100 transition-opacity">{ep.path}</td>
                                <td className="px-8 py-5 text-right text-white font-mono tracking-tighter">{ep.p95}MS</td>
                                <td className={`px-8 py-5 text-right ${ep.trend.startsWith('+') ? 'text-red-400' : 'text-green-400'} font-black italic`}>{ep.trend}</td>
                                <td className="px-8 py-5 text-right">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border 
                                        ${ep.status === 'healthy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            ep.status === 'warn' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20 shadow-glow-sm'}`}>
                                        {ep.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
