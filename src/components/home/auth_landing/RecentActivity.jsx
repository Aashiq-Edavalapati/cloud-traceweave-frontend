'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';

export const RecentActivity = () => {
  const { globalHistory } = useAppStore();
  
  // Show only the top 5 most recent
  const recentExecutions = globalHistory.slice(0, 5);

  const getRelativeTime = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '< 1m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const getStatusColor = (code) => {
    if (!code) return 'text-text-muted';
    if (code >= 200 && code < 300) return 'text-emerald-500';
    if (code >= 300 && code < 400) return 'text-blue-500';
    if (code >= 400 && code < 500) return 'text-amber-500';
    return 'text-red-500';
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: 'text-emerald-500',
      POST: 'text-brand-primary',
      PUT: 'text-blue-500',
      DELETE: 'text-red-500',
    };
    return colors[method] || 'text-text-secondary';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text-primary">
          Recent Executions
        </h3>
        <Link
          href="/history"
          className="text-xs text-brand-primary hover:underline"
        >
          View All
        </Link>
      </div>

      {recentExecutions.length === 0 ? (
        <div className="p-4 text-center text-xs text-text-muted bg-bg-panel border border-border-subtle rounded-md">
          No recent activity found.
        </div>
      ) : (
        <div className="space-y-2">
          {recentExecutions.map((log) => {
            let shortUrl = log.url;
            try {
              shortUrl = new URL(log.url).pathname;
            } catch (e) {}

            return (
              <Link
                key={log._id}
                href={`/history/${log._id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-2.5 bg-bg-panel border border-border-subtle rounded-md text-xs font-mono hover:border-text-muted transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span
                      className={`font-bold ${getMethodColor(log.method)}`}
                    >
                      {log.method}
                    </span>
                    <span
                      className="truncate text-text-secondary max-w-[120px]"
                      title={log.url}
                    >
                      {shortUrl}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={getStatusColor(log.status)}>
                      {log.status || 'ERR'}
                    </span>
                    <span className="text-text-muted w-8 text-right">
                      {getRelativeTime(log.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
