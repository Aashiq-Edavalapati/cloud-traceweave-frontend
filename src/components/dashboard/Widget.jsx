'use client';

import { cn } from '@/lib/utils';

export default function Widget({ title, children, className, action }) {
    return (
        <div className={cn("bg-bg-panel border border-border-subtle rounded-lg flex flex-col overflow-hidden", className)}>
            <div className="px-4 py-3 border-b border-border-subtle flex justify-between items-center bg-bg-sidebar/50">
                <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">{title}</h3>
                {action && <div>{action}</div>}
            </div>
            <div className="flex-1 p-4 relative">
                {children}
            </div>
        </div>
    );
}