'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { 
  Layers, 
  Search, 
  Network, 
  Database, 
  Lock, 
  Globe, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export default function EnvironmentsPage() {
  const router = useRouter();
  const { globalEnvironments, isGlobalEnvironmentsLoading, fetchGlobalEnvironments } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGlobalEnvironments();
  }, []);

  const filteredEnvironments = globalEnvironments.filter(env => 
    env.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    env.workspace?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigateToWorkspace = (workspaceId, envId) => {
    router.push(`/workspace/${workspaceId}?env=${envId}`);
  };

  const handleBackHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col p-8 max-w-7xl mx-auto w-full">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Layers size={28} className="text-brand-blue" />
            Global Environments
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage your environment variables (Production, Staging, Local) across all workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-blue transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search environments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-panel border border-border-subtle rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-blue transition-all"
            />
          </div>

          {/* Back to Home Button */}
          <button
            onClick={handleBackHome}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border-subtle rounded-lg hover:bg-bg-input transition-colors whitespace-nowrap"
          >
            <ArrowLeft size={16} />
            Home
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {isGlobalEnvironmentsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-bg-panel border border-border-subtle rounded-xl p-5 h-32 animate-pulse flex flex-col justify-between">
               <div className="h-5 w-1/2 bg-bg-input rounded"></div>
               <div className="h-4 w-3/4 bg-bg-input rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredEnvironments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border-subtle rounded-xl bg-bg-panel/20">
          <Database size={32} className="text-text-muted mb-4" />
          <h3 className="text-lg font-medium mb-1">No environments found</h3>
          <p className="text-text-secondary text-sm">Create an environment inside a workspace to manage variables.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEnvironments.map((env) => (
            <div 
              key={env.id} 
              onClick={() => handleNavigateToWorkspace(env.workspaceId, env.id)}
              className="group bg-bg-panel border border-border-subtle rounded-xl p-5 hover:border-brand-blue/50 transition-all hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] cursor-pointer flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-brand-blue/10 text-brand-blue">
                    <Database size={16} />
                  </div>
                  <h3 className="font-semibold text-text-primary group-hover:text-brand-blue transition-colors">
                    {env.name}
                  </h3>
                </div>
                <div title={env.isPersistent ? "Shared with Workspace" : "Private to you"}>
                  {env.isPersistent 
                    ? <Globe size={14} className="text-text-muted" /> 
                    : <Lock size={14} className="text-text-muted" />}
                </div>
              </div>

              <div className="mt-auto space-y-3">
                {/* Parent Workspace Tag */}
                <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-base/50 px-2 py-1.5 rounded-md border border-border-subtle/50 w-fit">
                  <Network size={12} className="text-brand-orange" />
                  <span className="truncate max-w-[150px]">
                    {env.workspace?.name || 'Unknown Workspace'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                  <div className="text-xs text-text-muted font-mono">
                    <span className="text-text-primary font-bold">
                      {env._count?.variables || 0}
                    </span> variables
                  </div>
                  <span className="text-[10px] flex items-center gap-1 text-text-secondary group-hover:text-brand-blue transition-colors font-medium uppercase tracking-wider">
                    Edit <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}