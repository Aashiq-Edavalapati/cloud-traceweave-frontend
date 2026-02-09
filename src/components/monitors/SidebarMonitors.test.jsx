import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarMonitors from './SidebarMonitors';
import { useAppStore } from '@/store/useAppStore';

// Mock the store
jest.mock('@/store/useAppStore');

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Activity: () => <span data-testid="icon-activity" />,
    MoreHorizontal: () => <span data-testid="icon-more" />,
    CheckCircle2: () => <span data-testid="icon-check" />,
    AlertCircle: () => <span data-testid="icon-alert" />,
    Pin: () => <span data-testid="icon-pin" />,
}));

// Mock ContextMenu since it's already tested
jest.mock('@/components/ui/ContextMenu', () => {
    return function MockContextMenu(props) {
        if (props.x === null) return null;
        return (
            <div data-testid="context-menu">
                <button onClick={props.onRename}>Rename</button>
                <button onClick={props.onDuplicate}>Duplicate</button>
                <button onClick={props.onDelete}>Delete</button>
                <button onClick={props.onPin}>Pin</button>
                <button onClick={props.onClose}>Close</button>
            </div>
        );
    };
});

describe('SidebarMonitors', () => {
    const mockMonitorStates = {
        'm1': { id: 'm1', name: 'Monitor 1', pinned: false, status: 'healthy' },
        'm2': { id: 'm2', name: 'Monitor 2', pinned: true, status: 'unhealthy' },
    };

    const mockActions = {
        monitorStates: mockMonitorStates,
        activeTabId: null,
        openTab: jest.fn(),
        renameItem: jest.fn(),
        deleteItem: jest.fn(),
        duplicateItem: jest.fn(),
        togglePinItem: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useAppStore.mockReturnValue(mockActions);
    });

    it('renders monitors sorted by pinned status and name', () => {
        // Expected order: Pinned (Monitor 2) then Unpinned (Monitor 1)
        render(<SidebarMonitors />);
        const items = screen.getAllByText(/Monitor \d/);
        expect(items[0]).toHaveTextContent('Monitor 2');
        expect(items[1]).toHaveTextContent('Monitor 1');
    });

    it('displays correct status icons', () => {
        render(<SidebarMonitors />);
        expect(screen.getAllByTestId('icon-check')).toHaveLength(1); // Monitor 1
        expect(screen.getAllByTestId('icon-alert')).toHaveLength(1); // Monitor 2
    });

    it('calls openTab on click', () => {
        render(<SidebarMonitors />);
        fireEvent.click(screen.getByText('Monitor 1'));
        expect(mockActions.openTab).toHaveBeenCalledWith('m1', true);
    });

    it('calls openTab with permanent flag on double click', () => {
        render(<SidebarMonitors />);
        fireEvent.doubleClick(screen.getByText('Monitor 1'));
        expect(mockActions.openTab).toHaveBeenCalledWith('m1', false);
    });

    it('opens context menu on right click', () => {
        render(<SidebarMonitors />);
        const monitor = screen.getByText('Monitor 1').closest('div').parentElement;
        fireEvent.contextMenu(monitor);
        expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    it('handles rename item via context menu', () => {
        render(<SidebarMonitors />);
        const monitor = screen.getByText('Monitor 1').closest('div').parentElement;
        fireEvent.contextMenu(monitor);

        // Click rename in context menu
        fireEvent.click(screen.getByText('Rename'));

        // Input should appear
        const input = screen.getByDisplayValue('Monitor 1');
        fireEvent.change(input, { target: { value: 'New Name' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(mockActions.renameItem).toHaveBeenCalledWith('m1', 'New Name');
    });

    it('renders empty state when no monitors', () => {
        useAppStore.mockReturnValue({
            ...mockActions,
            monitorStates: {},
        });
        render(<SidebarMonitors />);
        expect(screen.getByText('No monitors created')).toBeInTheDocument();
    });
});
