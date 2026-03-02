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
    Trash: () => <span data-testid="icon-trash-2" />,
    Loader2: () => <span data-testid="icon-loader" />,
    Globe: () => <span data-testid="icon-globe" />,
    FolderSync: () => <span data-testid="icon-folder" />,
}));

// Mock date-fns format function
jest.mock('date-fns', () => ({
    format: (date, format) => {
        if (format === 'MMM d, yyyy') {
            return 'Mar 2, 2026';
        }
        if (format === 'HH:mm') {
            return '20:14';
        }
        return date.toString();
    },
    isValid: (date) => true,
}));

describe('SidebarHistory', () => {
    const mockHistory = [
        {
            id: 'h1',
            url: 'http://api.test/users',
            method: 'GET',
            status: 200,
            duration: 100,
            createdAt: new Date().toISOString(),
            timings: { total: 100 },
        },
        {
            id: 'h2',
            url: 'http://api.test/login',
            method: 'POST',
            status: 401,
            duration: 50,
            createdAt: new Date().toISOString(),
            timings: { total: 50 },
        },
    ];

    const mockClearHistory = jest.fn();
    const mockRemoveFromHistory = jest.fn();
    const mockFetchHistory = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useAppStore.mockImplementation((selector) => {
            const store = {
                historyLogs: mockHistory,
                fetchHistory: mockFetchHistory,
                clearHistory: mockClearHistory,
                removeFromHistory: mockRemoveFromHistory,
            };
            return selector(store);
        });
    });

    it('renders history items', () => {
        render(<SidebarHistory />);
        expect(screen.getByText(/http:\/\/api\.test\/users/)).toBeInTheDocument();
        expect(screen.getByText(/http:\/\/api\.test\/login/)).toBeInTheDocument();
    });

    it('filters history by text', () => {
        render(<SidebarHistory />);
        const input = screen.getByPlaceholderText('Search logs...');
        fireEvent.change(input, { target: { value: 'users' } });

        expect(screen.getByText(/http:\/\/api\.test\/users/)).toBeInTheDocument();
        expect(screen.queryByText(/http:\/\/api\.test\/login/)).not.toBeInTheDocument();
    });

    it('filters history by status (success)', () => {
        render(<SidebarHistory />);
        const successFilter = screen.getByText('2XX');
        fireEvent.click(successFilter);

        expect(screen.getByText(/http:\/\/api\.test\/users/)).toBeInTheDocument();
        expect(screen.queryByText(/http:\/\/api\.test\/login/)).not.toBeInTheDocument();
    });

    it('toggles scope', () => {
        render(<SidebarHistory />);
        const globalBtn = screen.getByText('Global');
        fireEvent.click(globalBtn);
        expect(mockFetchHistory).toHaveBeenCalledWith('all', 1, 40);

        const workspaceBtn = screen.getByText('Workspace');
        fireEvent.click(workspaceBtn);
        expect(mockFetchHistory).toHaveBeenCalledWith('workspace', 1, 40);
    });

    it('clears history when trash icon is clicked', () => {
        render(<SidebarHistory />);
        const trashIcon = screen.getByTestId('icon-trash');
        const clearBtn = trashIcon.closest('button');
        fireEvent.click(clearBtn);
        expect(mockClearHistory).toHaveBeenCalled();
    });

    it('removes single item when delete button is hovered and clicked', () => {
        render(<SidebarHistory />);
        const historyItems = screen.getAllByText(/http:\/\/api\.test/);
        const firstItem = historyItems[0].closest('div.group');
        const deleteButton = firstItem.querySelector('button');
        fireEvent.click(deleteButton);
        expect(mockRemoveFromHistory).toHaveBeenCalledWith('h1');
    });

    it('renders empty state when no history', () => {
        useAppStore.mockImplementation((selector) => {
            const store = {
                historyLogs: [],
                fetchHistory: mockFetchHistory,
                clearHistory: mockClearHistory,
                removeFromHistory: mockRemoveFromHistory,
            };
            return selector(store);
        });
        render(<SidebarHistory />);
        // When history is empty, the component doesn't render items
        expect(screen.queryByText(/http:\/\/api\.test/)).not.toBeInTheDocument();
    });
});
