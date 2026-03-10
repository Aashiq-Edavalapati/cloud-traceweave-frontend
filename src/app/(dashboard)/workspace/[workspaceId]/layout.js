'use client';

import { useParams } from 'next/navigation';
import MainSidebar from '@/components/layout/MainSidebar';
import Header from '@/components/layout/Header';

export default function WorkspaceLayout({ children }) {
    const { workspaceId } = useParams();

    return (
        <div className="fixed inset-0 flex bg-transparent text-text-primary overflow-hidden">
            <MainSidebar workspaceId={workspaceId} />
            <div className="flex-1 flex flex-col min-w-0">
                <Header workspaceId={workspaceId} />
                <div className="flex-1 flex overflow-hidden relative">
                    {children}
                </div>
            </div>
        </div>
    );
}
