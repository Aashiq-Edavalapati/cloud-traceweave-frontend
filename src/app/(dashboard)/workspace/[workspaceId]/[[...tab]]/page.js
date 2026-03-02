'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import MainSidebar from '@/components/layout/MainSidebar';
import Header from '@/components/layout/Header';
import ResizablePanel from '@/components/layout/ResizablePanel';
import RequestPanel from '@/components/request/RequestPanel';
import DashboardPanel from '@/components/dashboard/DashboardPanel';
import { useAppStore } from '@/store/useAppStore';

const SIDEBAR_MAPPING = {
    collections: 'Collections',
    monitor: 'Monitor',
    environments: 'Environments',
    history: 'History',
    apis: 'APIs'
};

export default function WorkspaceEditor() {
    const { workspaceId, tab } = useParams();
    const { activeView, setActiveWorkspace, setActiveSidebarItem } = useAppStore();

    // ✅ Set active workspace from URL
    useEffect(() => {
        if (workspaceId) {
            setActiveWorkspace(workspaceId);
        }
    }, [workspaceId, setActiveWorkspace]);

    // ✅ Sync URL → Zustand state (ONLY ONE DIRECTION)
    useEffect(() => {
        if (tab && tab[0]) {
            const urlItem = tab[0].toLowerCase();
            const mappedTab = SIDEBAR_MAPPING[urlItem] || 'Collections';
            setActiveSidebarItem(mappedTab);
        } else {
            setActiveSidebarItem('Collections');
        }
    }, [tab, setActiveSidebarItem]);

    return (
        <div className="fixed inset-0 flex bg-transparent text-text-primary overflow-hidden">
            <MainSidebar workspaceId={workspaceId} />
            <div className="flex-1 flex flex-col min-w-0">
                <Header workspaceId={workspaceId} />
                <div className="flex-1 flex overflow-hidden relative">
                    {activeView === 'dashboard' ? (
                        <DashboardPanel />
                    ) : (
                        <>
                            <ResizablePanel />
                            <RequestPanel />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}