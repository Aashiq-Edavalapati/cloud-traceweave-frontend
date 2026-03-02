'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingDown, AlertCircle, CheckCircle2, TrendingUp, Minus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

// Helper to format large numbers (e.g., 1500 -> 1.5K)
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export const StatsGrid = () => {
  const { globalStats, availableWorkspaces } = useAppStore();

  // Show a loading skeleton if the stats haven't arrived yet
  if (!globalStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-bg-panel border border-border-subtle rounded-lg p-4 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  const { requests, latency, errorRate } = globalStats;

  // Dynamic Trend Helper
  const getTrendData = (trend, type) => {
    const isZero = Math.abs(trend) < 0.1;
    const formattedTrend = isZero ? '0%' : `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`;
    
    if (isZero) return { color: 'text-text-muted', icon: Minus, text: 'Stable' };

    // Logic: Is it a "good" trend?
    let isGood = false;
    if (type === 'requests') isGood = trend > 0; // More requests = Good
    if (type === 'latency' || type === 'errors') isGood = trend < 0; // Lower latency/errors = Good

    return {
      color: isGood ? 'text-emerald-500' : 'text-red-500',
      icon: trend > 0 ? TrendingUp : TrendingDown,
      text: formattedTrend
    };
  };

  const reqTrend = getTrendData(requests.trend, 'requests');
  const latTrend = getTrendData(latency.trend, 'latency');
  const errTrend = getTrendData(errorRate.trend, 'errors');

  const stats = [
    { 
      label: 'Total Requests', 
      value: formatNumber(requests.value), 
      trend: reqTrend,
      icon: Activity 
    },
    { 
      label: 'Avg Latency', 
      value: `${latency.value}ms`, 
      trend: latTrend,
      icon: TrendingDown 
    },
    { 
      label: 'Error Rate', 
      value: `${errorRate.value.toFixed(1)}%`, 
      trend: errTrend,
      icon: AlertCircle 
    },
    { 
      label: 'Active Workspaces', 
      value: availableWorkspaces.length.toString(), 
      trend: { color: 'text-text-muted', icon: CheckCircle2, text: 'Ready' },
      icon: CheckCircle2 
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div key={i} variants={itemVariants} className="bg-bg-panel border border-border-subtle rounded-lg p-4 hover:border-border-strong transition-colors shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-text-secondary font-medium">{stat.label}</p>
            <stat.icon size={14} className="text-text-muted" />
          </div>
          <p className="text-2xl font-mono font-semibold text-text-primary">{stat.value}</p>
          <div className="flex items-center gap-1 mt-1">
             <stat.trend.icon size={12} className={stat.trend.color} />
             <p className={`text-xs font-medium ${stat.trend.color}`}>{stat.trend.text}</p>
             <span className="text-[10px] text-text-muted ml-1 hidden lg:inline">vs last 7d</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};