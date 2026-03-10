'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

export const ResizableSidebar = ({ children }) => {
    // Persistent width: loads from localStorage or defaults to 260
    const [sidebarWidth, setSidebarWidth] = useState(260);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef(null);

    // Load saved width on mount
    useEffect(() => {
        const savedWidth = localStorage.getItem('sidebar-width');
        if (savedWidth) setSidebarWidth(parseInt(savedWidth));
    }, []);

    const startResizing = useCallback((e) => {
        setIsResizing(true);
        // Prevent text selection during drag
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
        document.body.style.userSelect = 'auto';
        document.body.style.cursor = 'default';
        localStorage.setItem('sidebar-width', sidebarWidth.toString());
    }, [sidebarWidth]);

    const resize = useCallback((e) => {
        if (isResizing) {
            const newWidth = e.clientX;
            // Constraints: 200px to 450px
            if (newWidth >= 200 && newWidth <= 450) {
                setSidebarWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }
    }, [isResizing, resize, stopResizing]);

    return (
        <aside 
            ref={sidebarRef}
            style={{ width: `${sidebarWidth}px` }} 
            className={`
                relative flex flex-col shrink-0 h-full
                bg-bg-sidebar/95 backdrop-blur-xl
                border-r border-border-subtle 
                transition-all duration-300 ease-in-out
                ${isResizing ? 'transition-none border-r-brand-primary/50' : ''}
                z-40
            `}
        >
            {/* Sidebar Content Wrapper */}
            <div className="flex flex-col h-full w-full overflow-hidden">
                {children}
            </div>

            {/* Tactile Resize Handle */}
            <div 
                onMouseDown={startResizing}
                className={`
                    absolute top-0 -right-1 bottom-0 w-2 
                    cursor-col-resize z-50 group
                    hover:bg-brand-primary/10 transition-colors
                `}
            >
                {/* Visual Line */}
                <div className={`
                    absolute top-0 right-[3px] bottom-0 w-[2px] 
                    transition-all duration-200
                    group-hover:bg-brand-primary
                    ${isResizing ? 'bg-brand-primary h-full opacity-100' : 'bg-transparent opacity-0'}
                `} />
            </div>
        </aside>
    );
};