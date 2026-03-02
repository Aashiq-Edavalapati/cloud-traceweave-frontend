'use client';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, GripVertical, Pin, Box, Zap, Activity, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import ContextMenu from '../ui/ContextMenu';
import { useModal } from '@/components/providers/ModalProvider'; // Added import

// Protocol Mapping for Icons and Colors
const PROTOCOL_CONFIG = {
  http: { icon: ArrowRightLeft, color: 'text-emerald-500' },
  graphql: { icon: Box, color: 'text-pink-500' },
  grpc: { icon: Zap, color: 'text-blue-400' },
  websocket: { icon: Activity, color: 'text-brand-primary' },
};

export function SortableRequest({ id, protocol, method, name, active, pinned, onClick }) {
  const store = useAppStore();
  
  // 1. Initialize the custom modal hook
  const { showPrompt, showConfirm } = useModal();
  
  // DISABLE dragging if pinned
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
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
    POST: 'text-method-post',
    PUT: 'text-method-put',
    DELETE: 'text-method-delete',
    PATCH: 'text-method-patch'
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

  // Helper to render the method text OR the protocol icon
  const renderProtocolIndicator = () => {
    const safeProtocol = protocol || 'http';
    
    if (safeProtocol === 'http') {
      return (
        <span className={`text-[9px] font-bold ${methodColors[method] || 'text-gray-400'}`}>
          {method || 'GET'}
        </span>
      );
    }

    const ProtoIcon = PROTOCOL_CONFIG[safeProtocol]?.icon || Box;
    const protoColor = PROTOCOL_CONFIG[safeProtocol]?.color || 'text-gray-400';

    return <ProtoIcon size={14} className={protoColor} title={safeProtocol.toUpperCase()} />;
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group flex items-center gap-2 px-2 py-1.5 ml-3 mr-2 rounded-md cursor-pointer border border-transparent transition-all select-none relative",
          active ? "bg-bg-input border-border-subtle text-text-primary" : "text-text-secondary hover:bg-bg-panel hover:text-text-primary",
          isOver && !isDragging ? "ring-1 ring-brand-primary/50" : "" 
        )}
        onClick={handleSingleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {/* Drag indicator line */}
        {isOver && !isDragging && (
           <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-brand-primary z-50 rounded-full shadow-[0_0_8px_rgba(255,100,0,0.8)]" />
        )}

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

        {/* --- REPLACED: Icon or Method Text --- */}
        <div className="w-8 flex justify-center items-center">
          {renderProtocolIndicator()}
        </div>
        
        <span className="text-xs truncate flex-1 flex items-center gap-2">
            {name}
            {pinned && <Pin size={10} className="text-brand-primary fill-brand-primary rotate-45" />}
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
            
            // 2. Replaced native prompt
            onRename={() => { 
                setContextMenu({ x: null, y: null });
                showPrompt(
                  "Enter a new name for this request:",
                  (newName) => {
                    if (newName && newName.trim() !== '') {
                      store.renameItem(id, newName.trim());
                    }
                  },
                  name,
                  "Rename Request"
                );
            }}
            
            onDuplicate={() => { store.duplicateItem(id); setContextMenu({ x: null, y: null }); }}
            
            // 3. Replaced native confirm (added safety check)
            onDelete={() => { 
                setContextMenu({ x: null, y: null });
                showConfirm(
                  `Are you sure you want to delete the request "${name}"?`,
                  () => {
                    store.deleteItem(id);
                  },
                  "Delete Request"
                );
            }}
            
            isPinned={pinned}
            onPin={() => { store.togglePinItem(id); setContextMenu({ x: null, y: null }); }}
        />
      )}
    </>
  );
}
