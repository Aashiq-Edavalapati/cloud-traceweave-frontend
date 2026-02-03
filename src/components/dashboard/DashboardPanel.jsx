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
        <div className="flex-1 h-full overflow-y-auto bg-[#0F0F0F] p-6 custom-scrollbar">

            {/* ================= TOP BAR ================= */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-lg font-medium text-[#EDEDED] flex items-center gap-2">
                        <Activity size={18} className="text-brand-orange" />
                        Performance Monitor
                    </h1>
                    <p className="text-xs text-[#666] mt-1 font-mono">
                        ENV: PRODUCTION • us-east-1
                    </p>
                </div>

                {/* Time range controls */}
                <div className="flex bg-[#1A1A1A] p-1 rounded border border-[#2A2A2A]">
                    {['1h', '24h', '7d', '30d'].map(range => (
                        <button
                            key={range}
                            className={`px-3 py-1 text-xs font-medium rounded ${range === '24h'
                                    ? 'bg-[#333] text-white'
                                    : 'text-[#666] hover:text-[#999]'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* ================= KPI CARDS ================= */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <MetricCard title="Avg Latency" value="142" unit="ms" trend="+12%" icon={Clock} />
                <MetricCard title="Throughput" value="2.4k" unit="rpm" trend="+5.2%" trendUpBad={false} icon={Zap} />
                <MetricCard title="Error Rate" value="0.82" unit="%" trend="-0.4%" icon={AlertTriangle} />
                <MetricCard title="Active Services" value="14" unit="/ 16" trend="0%" trendUpBad={false} icon={Server} />
            </div>

            {/* ================= CHARTS SECTION ================= */}
            <div className="grid grid-cols-12 gap-6 h-[380px] mb-6">

                {/* Latency Area Chart */}
                <div className="col-span-8 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm p-5 flex flex-col">
                    <h3 className="text-xs font-bold text-[#888] uppercase tracking-wider mb-6">
                        Request Volume vs Latency
                    </h3>

                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={TRAFFIC_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                            <XAxis dataKey="time" stroke="#444" fontSize={10} />
                            <YAxis stroke="#444" fontSize={10} />
                            <RechartsTooltip content={<CustomTooltip />} />

                            {/* SLA threshold */}
                            <ReferenceLine y={160} stroke="#EF4444" strokeDasharray="3 3" />

                            <Area
                                type="monotone"
                                dataKey="latency"
                                stroke="#0069D9"
                                fillOpacity={0.3}
                                fill="#0069D9"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Status Code Bar Chart */}
                <div className="col-span-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm p-5">
                    <h3 className="text-xs font-bold text-[#888] uppercase tracking-wider mb-6">
                        Response Codes
                    </h3>

                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ERROR_DISTRIBUTION} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Bar dataKey="value">
                                {ERROR_DISTRIBUTION.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ================= ENDPOINT TABLE ================= */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs text-[#555] border-b border-[#222]">
                            <th className="px-5 py-3">Method</th>
                            <th className="px-5 py-3">Endpoint</th>
                            <th className="px-5 py-3 text-right">P95</th>
                            <th className="px-5 py-3 text-right">Trend</th>
                            <th className="px-5 py-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ENDPOINTS.map((ep, i) => (
                            <tr key={i} className="border-b border-[#222]">
                                <td className="px-5 py-3">{ep.method}</td>
                                <td className="px-5 py-3 font-mono">{ep.path}</td>
                                <td className="px-5 py-3 text-right">{ep.p95}ms</td>
                                <td className="px-5 py-3 text-right">{ep.trend}</td>
                                <td className="px-5 py-3 text-right">{ep.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
