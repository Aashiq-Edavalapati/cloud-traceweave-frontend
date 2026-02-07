'use client';
import { useAppStore } from '@/store/useAppStore';
import { Trash2 } from 'lucide-react';

export default function CookiesEditor() {
    const store = useAppStore();
    const activeId = store.activeTabId;
    const cookies = store.requestStates[activeId]?.cookies || [];

    return (
        <div className="flex-1 bg-bg-base p-4 overflow-y-auto custom-scrollbar h-full">
            <h3 className="text-xs font-semibold text-text-secondary mb-3">Cookies</h3>
            <div className="border border-border-subtle rounded overflow-hidden select-none">
                <div className="grid grid-cols-[1fr_1fr_30px] bg-bg-input border-b border-border-subtle text-xs font-medium text-text-secondary py-1.5">
                    <div className="pl-3">Key</div>
                    <div className="pl-2 border-l border-border-subtle">Value</div>
                    <div></div>
                </div>
                {cookies.map((cookie, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_30px] border-b border-border-subtle text-xs text-text-primary group hover:bg-bg-input/50 transition-colors">
                        <input
                            type="text" placeholder="Cookie Name" value={cookie.key}
                            onChange={(e) => store.updateRequestListConfig('cookies', index, 'key', e.target.value)}
                            className="bg-transparent px-3 py-1.5 focus:outline-none placeholder:text-text-muted"
                        />
                        <input
                            type="text" placeholder="Value" value={cookie.value}
                            onChange={(e) => store.updateRequestListConfig('cookies', index, 'value', e.target.value)}
                            className="bg-transparent px-2 py-1.5 border-l border-border-subtle focus:outline-none placeholder:text-text-muted"
                        />
                        <div
                            className="flex justify-center items-center opacity-0 group-hover:opacity-100 cursor-pointer text-text-secondary hover:text-red-500"
                            onClick={() => store.removeRequestListItem('cookies', index)}
                        >
                            <Trash2 size={12} />
                        </div>
                    </div>
                ))}
                {cookies.length === 0 && (
                    <div
                        className="p-2 text-xs text-text-muted cursor-text hover:bg-bg-input/30"
                        onClick={() => store.updateRequestListConfig('cookies', 0, 'key', '')}
                    >
                        Click to add cookie...
                    </div>
                )}
            </div>
        </div>
    );
}