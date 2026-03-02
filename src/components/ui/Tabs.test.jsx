import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from './Tabs';

describe('Tabs', () => {
    const mockProps = {
        tabs: ['Tab1', 'Tab2', 'Tab3'],
        activeTab: 'Tab1',
        onTabClick: jest.fn(),
    };

    it('renders all tabs', () => {
        render(<Tabs {...mockProps} />);
        mockProps.tabs.forEach((tab) => {
            expect(screen.getByText(tab)).toBeInTheDocument();
        });
    });

    it('applies active styles to the active tab', () => {
        render(<Tabs {...mockProps} />);
        const activeTab = screen.getByText('Tab1');
        expect(activeTab).toHaveClass('text-text-primary', 'border-brand-primary');
    });

    it('applies inactive styles to inactive tabs', () => {
        render(<Tabs {...mockProps} />);
        const inactiveTab = screen.getByText('Tab2');
        expect(inactiveTab).toHaveClass('border-transparent');
        expect(inactiveTab).not.toHaveClass('text-text-primary', 'border-brand-primary');
    });

    it('calls onTabClick when a tab is clicked', () => {
        render(<Tabs {...mockProps} />);
        fireEvent.click(screen.getByText('Tab2'));
        expect(mockProps.onTabClick).toHaveBeenCalledWith('Tab2');
    });
});
