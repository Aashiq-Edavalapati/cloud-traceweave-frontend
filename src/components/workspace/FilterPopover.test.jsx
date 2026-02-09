import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPopover } from './FilterPopover';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    CheckCircle2: () => <span data-testid="icon-check" />,
}));

describe('FilterPopover', () => {
    const mockProps = {
        isOpen: true,
        onClose: jest.fn(),
        pendingFilters: {
            type: [],
            access: [],
        },
        setPendingFilters: jest.fn(),
        onApply: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly when open', () => {
        render(<FilterPopover {...mockProps} />);
        expect(screen.getByText('Filter View')).toBeInTheDocument();
        expect(screen.getByText('Workspace Type')).toBeInTheDocument();
        expect(screen.getByText('Access Level')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        const { container } = render(<FilterPopover {...mockProps} isOpen={false} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('calls setPendingFilters when a filter is clicked', () => {
        render(<FilterPopover {...mockProps} />);
        const teamFilter = screen.getByText('Team');
        fireEvent.click(teamFilter);
        expect(mockProps.setPendingFilters).toHaveBeenCalledTimes(1);
    });

    it('shows checkmark when filter is selected', () => {
        const props = {
            ...mockProps,
            pendingFilters: {
                type: ['Team'],
                access: [],
            },
        };
        render(<FilterPopover {...props} />);
        expect(screen.getByTestId('icon-check')).toBeInTheDocument();
    });

    it('calls setPendingFilters to reset when Reset is clicked', () => {
        render(<FilterPopover {...mockProps} />);
        const resetButton = screen.getByText('Reset');
        fireEvent.click(resetButton);
        expect(mockProps.setPendingFilters).toHaveBeenCalledWith({ type: [], access: [] });
    });

    it('calls onApply when Apply Filters is clicked', () => {
        render(<FilterPopover {...mockProps} />);
        const applyButton = screen.getByText('Apply Filters');
        fireEvent.click(applyButton);
        expect(mockProps.onApply).toHaveBeenCalledTimes(1);
    });
});
