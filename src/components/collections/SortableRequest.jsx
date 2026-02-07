'use client';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, GripVertical, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import ContextMenu from '../ui/ContextMenu';

export function SortableRequest({ id, method, name, active, pinned, onClick }) {
  const store = useAppStore();
  
  // DISABLE dragging if pinned
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id, 
    data: { type: 'request' },
    disabled: pinned 
  });

  const [contextMenu, setContextMenu] = useState({ x: null, y: null });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  const methodColors = {
    GET: 'text-method-get',
    POST: 'text-brand-orange',
    PUT: 'text-blue-400',
    DELETE: 'text-red-500',
    PATCH: 'text-yellow-400'
  };

  const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleSingleClick = (e) => {
      e.stopPropagation();
      store.openTab(id, true);
  };

  const handleDoubleClick = (e) => {
      e.stopPropagation();
      store.openTab(id, false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group flex items-center gap-2 px-2 py-1.5 ml-3 mr-2 rounded-md cursor-pointer border border-transparent transition-all select-none relative",
          active ? "bg-bg-input border-border-subtle text-text-primary" : "text-text-secondary hover:bg-bg-panel hover:text-text-primary"
        )}
        onClick={handleSingleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {/* DRAG HANDLE - Conditional Rendering */}
        {pinned ? (
          <div className="w-3 h-3" /> // Spacer
        ) : (
          <div 
            {...attributes} 
            {...listeners}
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing hover:text-text-primary transition-opacity"
            onClick={(e) => e.stopPropagation()} 
          >
            <GripVertical size={12} />
          </div>
        )}

        <span className={`text-[9px] font-bold w-8 ${methodColors[method] || 'text-gray-400'}`}>
          {method}
        </span>
        
        <span className="text-xs truncate flex-1 flex items-center gap-2">
            {name}
            {pinned && <Pin size={10} className="text-brand-orange fill-brand-orange rotate-45" />}
        </span>

        <div 
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-bg-base rounded"
            onClick={(e) => { e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY }); }}
        >
          <MoreHorizontal size={14} className="hover:text-text-primary" />
        </div>
      </div>

       {contextMenu.x !== null && (
        <ContextMenu 
            x={contextMenu.x} 
            y={contextMenu.y} 
            onClose={() => setContextMenu({ x: null, y: null })}
            onRename={() => { 
                const newName = prompt("Rename Request:", name);
                if(newName) store.renameItem(id, newName);
                setContextMenu({ x: null, y: null });
            }}
            onDuplicate={() => { store.duplicateItem(id); setContextMenu({ x: null, y: null }); }}
            onDelete={() => { store.deleteItem(id); setContextMenu({ x: null, y: null }); }}
            isPinned={pinned}
            onPin={() => { store.togglePinItem(id); setContextMenu({ x: null, y: null }); }}
        />
      )}
    </>
  );
}