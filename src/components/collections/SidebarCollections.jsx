'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { SortableCollection } from './SortableCollection';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAppStore } from '@/store/useAppStore';

export default function SidebarCollections() {
  const {
    toggleCollectionCollapse,
    activeTabId,
    openTab,
    moveRequest,
    moveCollection,
    getFilteredCollections
  } = useAppStore();
  
  const collections = getFilteredCollections();
  
  // CRITICAL: Only pass root-level collections to the primary sortable context
  const rootCollections = collections.filter(c => !c.parentId);

  const [activeDragItem, setActiveDragItem] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const { type } = active.data.current || {};

    let item = null;
    if (type === 'collection') {
      item = collections.find(c => c.id === active.id);
    } else {
      for (const col of collections) {
        const found = col.items.find((i) => i.id === active.id);
        if (found) {
          item = found;
          break;
        }
      }
    }
    setActiveDragItem(item);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over) return;

    if (active.id !== over.id) {
      const type = active.data.current?.type;

      if (type === 'collection') {
        moveCollection(active.id, over.id);
      } else {
        moveRequest(active.id, over.id);
      }
    }
  };

  const handleRequestClick = (id) => {
    openTab(id, true);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
        <SortableContext
          items={rootCollections.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {rootCollections.map((col) => (
            <SortableCollection
              key={col.id}
              collection={col}
              activeRequestId={activeTabId}
              onToggle={toggleCollectionCollapse}
              onRequestClick={handleRequestClick}
            />
          ))}
          {rootCollections.length === 0 && (
            <div className="p-4 text-center text-xs text-text-secondary flex flex-col gap-2">
              <span>No collections found.</span>
              <button
                onClick={() => useAppStore.getState().fetchCollections(useAppStore.getState().activeWorkspaceId)}
                className="text-brand-primary hover:underline"
              >
                Refresh
              </button>
            </div>
          )}
        </SortableContext>
      </div>
      {mounted &&
        createPortal(
          <DragOverlay>
            {activeDragItem ? (
              <div className="bg-bg-panel border border-brand-blue/50 shadow-2xl rounded opacity-90 p-2 w-[240px] flex items-center gap-2">
                <span className="text-[10px] font-mono text-brand-primary">
                  MOVING
                </span>
                <span className="text-xs text-text-primary font-semibold">
                  {activeDragItem.name}
                </span>
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
