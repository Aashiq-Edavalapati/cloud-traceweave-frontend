'use client';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronRight, ChevronDown, FolderOpen, Folder, Plus, FolderPlus, MoreHorizontal, GripVertical, Pin } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableRequest } from './SortableRequest';
import { useAppStore } from '@/store/useAppStore';
import ContextMenu from '../ui/ContextMenu';
import { useModal } from '@/components/providers/ModalProvider';

export function SortableCollection({ collection, activeRequestId, onToggle, onRequestClick }) {
  const store = useAppStore();
<<<<<<< Updated upstream
  // 1. Destructure showPrompt alongside showConfirm
  const { showConfirm, showPrompt } = useModal();
=======
<<<<<<< Updated upstream
=======
  const { showConfirm, showPrompt } = useModal();
>>>>>>> Stashed changes

  const allCollections = store.getFilteredCollections();
  const childCollections = allCollections.filter(c => c.parentId === collection.id);
>>>>>>> Stashed changes

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: collection.id,
    data: { type: 'collection' },
    disabled: collection.pinned
  });

  const [contextMenu, setContextMenu] = useState({ x: null, y: null });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCreateRequest = (e) => {
    e.stopPropagation();
    store.createRequest(collection.id);
    if (collection.collapsed) onToggle(collection.id);
  };

  const handleCreateSubCollection = (e) => {
    e.stopPropagation();
    showPrompt(
      "Enter a name for the new sub-collection:",
      (newName) => {
        if (newName && newName.trim() !== '') {
          store.createCollection(newName.trim(), collection.id); 
          if (collection.collapsed) onToggle(collection.id);
        }
      },
      "New Folder",
      "Create Sub-collection"
    );
  };

  const sortableItemIds = [
    ...childCollections.map(c => c.id),
    ...(collection.items || []).map(i => i.id)
  ];

  return (
    <>
      <div ref={setNodeRef} style={style} className="mb-1 select-none">
        <div
          className="group flex items-center gap-2 px-2 py-1.5 cursor-pointer text-text-secondary hover:text-text-primary rounded hover:bg-bg-panel relative"
          onClick={() => onToggle(collection.id)}
          onContextMenu={handleContextMenu}
        >
          {collection.pinned ? (
            <div className="w-4 h-4" />
          ) : (
            <div
              {...attributes}
              {...listeners}
              className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 text-text-tertiary hover:text-text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={12} />
            </div>
          )}

          <div className="p-1 text-brand-orange/80 relative">
            {collection.collapsed ? <Folder size={14} /> : <FolderOpen size={14} />}
            {collection.pinned && <div className="absolute -top-1 -right-1 bg-bg-base rounded-full p-[1px]"><Pin size={8} className="text-text-primary fill-current" /></div>}
          </div>

          <span className="text-xs font-semibold select-none flex-1 truncate">
            {collection.name}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div
              role="button"
              onClick={handleCreateSubCollection}
              className="p-1 hover:bg-bg-input rounded text-text-primary hover:text-brand-orange"
              title="Add Sub-collection"
            >
              <FolderPlus size={14} />
            </div>
            <div
              role="button"
              onClick={handleCreateRequest}
              className="p-1 hover:bg-bg-input rounded text-text-primary hover:text-brand-orange"
              title="Add Request"
            >
              <Plus size={14} />
            </div>
            <div
              role="button"
              onClick={(e) => { e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY }); }}
              className="p-1 hover:bg-bg-input rounded text-text-primary"
            >
              <MoreHorizontal size={14} />
            </div>
          </div>

          <div className="text-text-muted">
            {collection.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>

        {!collection.collapsed && (
          <div className="flex flex-col gap-[2px] mt-1 pl-1 border-l border-border-subtle ml-3">
            <SortableContext items={sortableItemIds} strategy={verticalListSortingStrategy}>
              {childCollections.map(childCol => (
                <SortableCollection
                  key={childCol.id}
                  collection={childCol}
                  activeRequestId={activeRequestId}
                  onToggle={onToggle}
                  onRequestClick={onRequestClick}
                />
              ))}

              {collection.items && collection.items.map(req => (
                <SortableRequest
                  key={req.id}
                  {...req}
                  protocol={req.protocol || 'http'}
                  method={req.config?.method || req.method || 'GET'}
                  active={activeRequestId === req.id}
                  onClick={() => onRequestClick(req.id)}
                />
              ))}
            </SortableContext>
          </div>
        )}
      </div>

      {contextMenu.x !== null && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu({ x: null, y: null })}
          
          // 2. Updated onRename using custom showPrompt
          onRename={() => {
<<<<<<< Updated upstream
            setContextMenu({ x: null, y: null }); // Close menu first
            
            showPrompt(
              "Enter a new name for this collection:",
              (newName) => {
                if (newName && newName.trim() !== '') {
                  store.renameItem(collection.id, newName.trim());
                }
              },
              collection.name,
              "Rename Collection"
            );
          }}

=======
<<<<<<< Updated upstream
            console.log("Rename clicked for collection:", collection.id);
            const newName = prompt("Rename Collection:", collection.name);
            console.log("User entered:", newName);
            console.log("store.renameItem exists?", typeof store.renameItem);
            if (newName) {
              console.log("Calling renameItem...");
              store.renameItem(collection.id, newName);
            }
            setContextMenu({ x: null, y: null });
          }}
          onDuplicate={() => { store.duplicateItem(collection.id); setContextMenu({ x: null, y: null }); }}
          onDelete={() => { store.deleteItem(collection.id); setContextMenu({ x: null, y: null }); }}
=======
            setContextMenu({ x: null, y: null });
            showPrompt(
              "Enter a new name for this collection:",
              (newName) => {
                if (newName && newName.trim() !== '') {
                  store.renameItem(collection.id, newName.trim());
                }
              },
              collection.name,
              "Rename Collection"
            );
          }}
>>>>>>> Stashed changes
          onDuplicate={() => { 
            store.duplicateItem(collection.id); 
            setContextMenu({ x: null, y: null }); 
          }}
<<<<<<< Updated upstream
          
          // 3. Updated onDelete using custom showConfirm
          onDelete={() => { 
            setContextMenu({ x: null, y: null }); // Close menu first
            
            showConfirm(
              `Are you sure you want to delete the collection "${collection.name}"?`,
              () => {
                store.deleteItem(collection.id);
              },
              "Delete Collection"
            );
          }}
          
=======
          onDelete={() => { 
            setContextMenu({ x: null, y: null });
            showConfirm(
              `Are you sure you want to delete the collection "${collection.name}"?`,
              () => store.deleteItem(collection.id),
              "Delete Collection"
            );
          }}
>>>>>>> Stashed changes
>>>>>>> Stashed changes
          isPinned={collection.pinned}
          onPin={() => { 
            store.togglePinItem(collection.id); 
            setContextMenu({ x: null, y: null }); 
          }}
        />
      )}
    </>
  );
}