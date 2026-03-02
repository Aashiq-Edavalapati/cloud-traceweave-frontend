'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Copy, Edit2, Trash2, Pin, PinOff } from 'lucide-react';

export default function ContextMenu({ x, y, onClose, onRename, onDuplicate, onDelete, isPinned, onPin }) {
    const ref = useRef(null);
    
    // Start hidden so we can measure it before the user sees it
    const [style, setStyle] = useState({ top: y, left: x, visibility: 'hidden' });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // useLayoutEffect runs synchronously immediately after React has performed all DOM mutations
    useLayoutEffect(() => {
        if (ref.current && x !== null && y !== null) {
            const rect = ref.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let adjustedX = x;
            let adjustedY = y;

            // Collision Detection: Right Edge
            if (x + rect.width > viewportWidth) {
                adjustedX = x - rect.width;
            }

            // Collision Detection: Bottom Edge
            if (y + rect.height > viewportHeight) {
                adjustedY = y - rect.height;
            }

            // Apply adjusted coordinates and make it visible
            setStyle({ 
                top: adjustedY, 
                left: adjustedX, 
                visibility: 'visible' 
            });
        }
    }, [x, y]);

    if (x === null || y === null) return null;

    return (
        <div
            ref={ref}
            style={style}
            className="fixed z-[9999] w-40 bg-bg-panel border border-border-strong rounded shadow-xl py-1 flex flex-col"
        >
            <button onClick={onPin} className="flex items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-brand-blue hover:text-white text-left">
                {isPinned ? <PinOff size={12} /> : <Pin size={12} />} {isPinned ? 'Unpin' : 'Pin to Top'}
            </button>
            <div className="h-[1px] bg-border-subtle my-1"></div>
            <button onClick={onRename} className="flex items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-brand-blue hover:text-white text-left">
                <Edit2 size={12} /> Rename
            </button>
            <button onClick={onDuplicate} className="flex items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-brand-blue hover:text-white text-left">
                <Copy size={12} /> Duplicate
            </button>
            <div className="h-[1px] bg-border-subtle my-1"></div>
            <button onClick={onDelete} className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-500 hover:text-white text-left">
                <Trash2 size={12} /> Delete
            </button>
        </div>
    );
}