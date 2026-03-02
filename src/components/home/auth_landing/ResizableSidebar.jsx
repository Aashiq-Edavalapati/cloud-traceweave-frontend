'use client';

import { useState, useEffect } from 'react';

export const ResizableSidebar = ({ children }) => {
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  
  const startResizing = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const resize = (e) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth >= 220 && newWidth <= 400) setSidebarWidth(newWidth);
      }
    };
    const stopResizing = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResizing);
    }
    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  return (
    <>
      <aside style={{ width: `${sidebarWidth}px` }} className="relative flex flex-col border-r border-border-subtle bg-bg-sidebar z-30 h-full">
        {children}
        <div 
          onMouseDown={startResizing}
          className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-brand-primary transition-colors z-40 opacity-0 hover:opacity-100"
        />
      </aside>
    </>
  );
};
