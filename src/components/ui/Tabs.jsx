'use client';
import React from 'react';

export const Tabs = ({ tabs, activeTab, onTabClick }) => {
    return (
        <div className="flex items-center gap-6 text-xs text-text-secondary border-b border-border-subtle select-none px-4">
            {tabs.map((tab) => (
                <div
                    key={tab}
                    onClick={() => onTabClick(tab)}
                    className={`
            pb-2 cursor-pointer border-b-2 transition-colors
            ${activeTab === tab
                            ? 'text-text-primary border-brand-primary'
                            : 'border-transparent hover:text-text-primary'
                        }
          `}
                >
                    {tab}
                </div>
            ))}
        </div>
    );
};