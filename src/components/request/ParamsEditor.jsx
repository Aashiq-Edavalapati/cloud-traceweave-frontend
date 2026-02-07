'use client';
import { useAppStore } from '@/store/useAppStore';
import KeyValueTable from './KeyValueTable';

export default function ParamsEditor() {
    const store = useAppStore();
    const activeId = store.activeTabId;
    const params = store.requestStates[activeId]?.params || [];

    return (
        <div className="flex-1 bg-bg-base p-4 overflow-y-auto custom-scrollbar h-full">
            <h3 className="text-xs font-semibold text-text-secondary mb-3">Query Params</h3>
            <KeyValueTable listKey="params" data={params} />
        </div>
    );
}