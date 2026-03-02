import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createUISlice } from './slices/uiSlice';
import { createWorkspaceSlice } from './slices/workspaceSlice';
import { createEnvironmentSlice } from './slices/environmentSlice';
import { createCollectionSlice } from './slices/collectionSlice';
import { createRequestSlice } from './slices/requestSlice';
import { createTabSlice } from './slices/tabSlice';
import { createMonitorSlice } from './slices/monitorSlice';
import { createExecutionSlice } from './slices/executionSlice';
import { createHistorySlice } from './slices/historySlice';

export const useAppStore = create(
  persist(
    (set, get) => ({
      ...createUISlice(set, get),
      ...createWorkspaceSlice(set, get),
      ...createEnvironmentSlice(set, get),
      ...createCollectionSlice(set, get),
      ...createRequestSlice(set, get),
      ...createTabSlice(set, get),
      ...createMonitorSlice(set, get),
      ...createExecutionSlice(set, get),
      ...createHistorySlice(set, get),

      // --- Facade Actions ---
      deleteItem: async (id) => {
        const state = get();
        
        if (state.collections.find(c => c.id === id)) {
            return get().deleteCollection(id);
        }
        if (state.requestStates[id]) {
            return get().deleteRequest(id);
        }
        if (state.monitorStates[id]) {
            return get().deleteMonitor(id);
        }
        
        const wsId = state.activeWorkspaceId;
        const envs = state.workspaceEnvironments[wsId] || [];
        if (envs.some(e => e.id === id)) {
            return get().deleteEnvironment(id);
        }
      },

      duplicateItem: async (id) => {
        const state = get();

        if (state.collections.find(c => c.id === id)) {
            return get().duplicateCollection(id);
        }
        if (state.requestStates[id]) {
            return get().duplicateRequest(id);
        }
        if (state.monitorStates[id]) {
            return get().duplicateMonitor(id);
        }
      },

      renameItem: async (id, newName) => {
        const state = get();

        if (state.collections.find(c => c.id === id)) {
            return get().renameCollection(id, newName);
        }
        if (state.requestStates[id]) {
            return get().renameRequest(id, newName);
        }
        if (state.monitorStates[id]) {
            return get().renameMonitor(id, newName);
        }
        
        const wsId = state.activeWorkspaceId;
        const envs = state.workspaceEnvironments[wsId] || [];
        if (envs.some(e => e.id === id)) {
            return get().renameEnvironment(id, newName);
        }
      },

      togglePinItem: (id) => {
          const state = get();

          if (state.monitorStates[id]) {
              return get().toggleMonitorPin(id);
          }
          if (state.requestStates[id]) {
              return get().toggleRequestPin(id);
          }
          if (state.collections.find(c => c.id === id)) {
              return get().toggleCollectionPin(id);
          }
          
          // Environment pinning
          const wsId = state.activeWorkspaceId;
          const envs = state.workspaceEnvironments[wsId] || [];
          const envIdx = envs.findIndex(e => e.id === id);
          if (envIdx !== -1) {
              const newEnvs = [...envs];
              newEnvs[envIdx] = { ...newEnvs[envIdx], pinned: !newEnvs[envIdx].pinned };
              set(state => ({
                  workspaceEnvironments: {
                      ...state.workspaceEnvironments,
                      [wsId]: newEnvs
                  }
              }));
          }
      }
    }),

    // 3. Persist Configuration Options
    {
      name: 'traceweave-ui-state', // The key in localStorage
      
      // 4. Determine EXACTLY what to save to local storage
      partialize: (state) => ({
        // UI Slice Layout
        sidebarWidth: state.sidebarWidth,
        responsePaneHeight: state.responsePaneHeight,
        activeSidebarItem: state.activeSidebarItem,
        
        // Tab Slice
        openTabs: state.openTabs,
        activeTabId: state.activeTabId,
        
        // Environment Slice
        selectedEnvIndex: state.selectedEnvIndex,

        // Persist local draft changes
        requestStates: state.requestStates,

        // Convert the Set into a standard Array before saving to JSON
        unsavedRequests: Array.from(state.unsavedRequests || []), 
      }),

      // Intercept the loaded data and convert the Array back into a Set
      merge: (persistedState, currentState) => {
        return {
          ...currentState,
          ...persistedState,
          unsavedRequests: new Set(persistedState.unsavedRequests || []), 
        };
      }
    }
  )
);