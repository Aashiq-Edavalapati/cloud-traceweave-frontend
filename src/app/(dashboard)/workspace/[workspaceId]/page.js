'use client';

import { useParams } from 'next/navigation';
import MainSidebar from '@/components/layout/MainSidebar';
import Header from '@/components/layout/Header';
import ResizablePanel from '@/components/layout/ResizablePanel';
import RequestPanel from '@/components/request/RequestPanel';
import DashboardPanel from '@/components/dashboard/DashboardPanel';
import { useAppStore } from '@/store/useAppStore';

export default function WorkspaceEditor() {
    const { workspaceId } = useParams();
    const { activeView } = useAppStore();

    return (
        <div className="flex h-screen w-full bg-bg-base text-text-primary overflow-hidden">
            <MainSidebar />
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