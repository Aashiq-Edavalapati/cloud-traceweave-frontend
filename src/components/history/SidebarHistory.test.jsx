import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarHistory from './SidebarHistory';
import { useAppStore } from '@/store/useAppStore';

// Mock the store
jest.mock('@/store/useAppStore');

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Search: () => <span data-testid="icon-search" />,
    Trash2: () => <span data-testid="icon-trash" />,
    MoreVertical: () => <span data-testid="icon-more" />,
    CheckCircle2: () => <span data-testid="icon-check" />,
    AlertCircle: () => <span data-testid="icon-alert" />,
    Clock: () => <span data-testid="icon-clock" />,
}));

describe('SidebarHistory', () => {
    const mockHistory = [
        {
            id: 'h1',
            url: 'http://api.test/users',
            method: 'GET',
            status: 200,
            duration: 100,
            timestamp: new Date().toISOString(),
        },
        {
            id: 'h2',
            url: 'http://api.test/login',
            method: 'POST',
            status: 401,
            duration: 50,
            timestamp: new Date().toISOString(),
        },
    ];

    const mockActions = {
        getFormattedHistory: jest.fn().mockReturnValue(mockHistory),
        clearHistory: jest.fn(),
        removeFromHistory: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useAppStore.mockReturnValue(mockActions);
    });

    it('renders history items', () => {
        render(<SidebarHistory />);
        expect(screen.getByText('api.test/users')).toBeInTheDocument();
        expect(screen.getByText('api.test/login')).toBeInTheDocument();
    });

    it('filters history by text', () => {
        render(<SidebarHistory />);
        const input = screen.getByPlaceholderText('Filter history...');
        fireEvent.change(input, { target: { value: 'users' } });

        expect(screen.getByText('api.test/users')).toBeInTheDocument();
        expect(screen.queryByText('api.test/login')).not.toBeInTheDocument();
    });

    it('filters history by status (success)', () => {
        render(<SidebarHistory />);
        const successFilter = screen.getByText('Success');
        fireEvent.click(successFilter);

        expect(screen.getByText('api.test/users')).toBeInTheDocument();
        expect(screen.queryByText('api.test/login')).not.toBeInTheDocument();
    });

    it('toggles scope', () => {
        render(<SidebarHistory />);
        const globalBtn = screen.getByText('Global');
        fireEvent.click(globalBtn);
        expect(mockActions.getFormattedHistory).toHaveBeenCalledWith('all');

        const workspaceBtn = screen.getByText('Workspace');
        fireEvent.click(workspaceBtn);
        expect(mockActions.getFormattedHistory).toHaveBeenCalledWith('workspace');
    });

    it('clears history when trash icon is clicked', () => {
        render(<SidebarHistory />);
        const clearBtn = screen.getByTitle('Clear All History');
        fireEvent.click(clearBtn);
        expect(mockActions.clearHistory).toHaveBeenCalled();
    });

    it('removes single item when delete button is clicked', () => {
        render(<SidebarHistory />);
        const deleteBtns = screen.getAllByTitle('Delete');
        fireEvent.click(deleteBtns[0]);
        expect(mockActions.removeFromHistory).toHaveBeenCalledWith('h1');
    });

    it('renders empty state when no history', () => {
        mockActions.getFormattedHistory.mockReturnValue([]);
        render(<SidebarHistory />);
        expect(screen.getByText('No history found')).toBeInTheDocument();
    });
});
