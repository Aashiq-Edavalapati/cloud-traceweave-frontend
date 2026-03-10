'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { ArrowLeft, GitMerge } from 'lucide-react';
import WorkflowCanvasWrapper from '@/components/workflow/WorkflowCanvas';
import { PacmanLoader } from 'react-spinners';
import { useModal } from '@/components/providers/ModalProvider';

export default function MainCanvas({ workflowId }) {
  const { workspaceId } = useParams();
  const router = useRouter();
  
  const { activeWorkflow, fetchWorkflow, saveWorkflowGraph } = useAppStore();
  const { showAlert } = useModal();

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow(workflowId);
    }
  }, [workflowId, fetchWorkflow]);

  if (!activeWorkflow) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-bg-base text-text-secondary">
        <PacmanLoader color="#EAC2FF" size={20} />
      </div>
    );
  }

  const handleSave = async (flowData) => {
    await saveWorkflowGraph(workflowId, flowData);
    showAlert('Workflow Saved!');
  };

  return (
    <div className="h-full w-full flex flex-col bg-bg-base overflow-hidden">
      {/* Slim Header for Fullscreen Mode */}
      <div className="h-14 shrink-0 bg-bg-panel border-b border-border-strong px-4 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push(`/workspace/${workspaceId}/workflows`)}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-input rounded transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="h-6 w-px bg-border-strong"></div>
          
          <div className="flex items-center gap-2">
            <div className="bg-brand-orange/10 p-1 rounded">
              <GitMerge size={16} className="text-brand-orange" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-text-primary leading-tight">{activeWorkflow.name}</h1>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Workflow Editor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 w-full relative min-h-0"> 
        <WorkflowCanvasWrapper 
          initialData={activeWorkflow.flowData} 
          onSave={handleSave} 
        />
      </div>
    </div>
  );
}