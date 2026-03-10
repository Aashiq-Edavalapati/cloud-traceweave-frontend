'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import ResizablePanel from '@/components/layout/ResizablePanel';
import RequestPanel from '@/components/request/RequestPanel';
import DashboardPanel from '@/components/dashboard/DashboardPanel';
import WorkflowList from '@/components/workflow/WorkflowList';
import WorkflowCanvas from '@/components/workflow/WorkflowCanvas';
import WorkspaceSettings from '@/components/workspace/WorkspaceSettings';
import { useAppStore } from '@/store/useAppStore';

const SIDEBAR_MAPPING = {
    collections: 'Collections',
    monitor: 'Monitor',
    environments: 'Environments',
    history: 'History',
    apis: 'APIs',
    workflows: 'Workflows',
    settings: 'Settings' 
};

export default function WorkspaceEditor() {
    const { workspaceId, tab } = useParams();
    const { activeView, setActiveWorkspace, setActiveSidebarItem, setActiveView } = useAppStore();

    const currentRoute = tab && tab[0] ? tab[0].toLowerCase() : null;
    const isWorkflowRoute = currentRoute === 'workflows';
    const isSettingsRoute = currentRoute === 'settings';
    const workflowId = isWorkflowRoute && tab.length > 1 ? tab[1] : null;

    useEffect(() => {
        if (workspaceId) {
            setActiveWorkspace(workspaceId);
        }
    }, [workspaceId, setActiveWorkspace]);

    useEffect(() => {
        if (currentRoute) {
            const mappedTab = SIDEBAR_MAPPING[currentRoute] || 'Collections';
            setActiveSidebarItem(mappedTab);
            
            if (isWorkflowRoute) setActiveView('workflow');
            else if (isSettingsRoute) setActiveView('settings');
            else if (currentRoute === 'dashboard') setActiveView('dashboard');
            else setActiveView('runner');
        } else {
            setActiveSidebarItem('Collections');
            setActiveView('runner');
        }
    }, [currentRoute, isWorkflowRoute, isSettingsRoute, setActiveSidebarItem, setActiveView]);

    if (activeView === 'dashboard') return <DashboardPanel />;
    
    if (activeView === 'workflow') {
        if (workflowId) return <WorkflowCanvas workflowId={workflowId} />;
        return <WorkflowList />;
    }

    if (activeView === 'settings') {
        return <WorkspaceSettings />;
    }

    return (
        <>
            <ResizablePanel />
            <RequestPanel />
        </>
    );
}