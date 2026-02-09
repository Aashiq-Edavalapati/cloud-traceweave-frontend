import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkspaceItem } from './WorkspaceItem';

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }) => {
        return <a href={href}>{children}</a>;
    };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Clock: () => <span data-testid="icon-clock" />,
    Globe: () => <span data-testid="icon-globe" />,
    Lock: () => <span data-testid="icon-lock" />,
    MoreVertical: () => <span data-testid="icon-more" />,
    Star: ({ onClick, className }) => <span data-testid="icon-star" onClick={onClick} className={className} />,
    Users: () => <span data-testid="icon-users" />,
}));

describe('WorkspaceItem', () => {
    const mockWs = {
        id: 'ws1',
        name: 'Test Workspace',
        description: 'A test workspace',
        type: 'Team',
        access: 'Private',
        lastActive: '2h ago',
        members: 5,
        status: 'active',
        traceCount: 10,
    };

    const mockProps = {
        ws: mockWs,
        viewMode: 'grid',
        isStarred: false,
        onToggleStar: jest.fn(),
        activeMenuId: null,
        setActiveMenuId: jest.fn(),
    };

    it('renders rendering in grid view', () => {
        render(<WorkspaceItem {...mockProps} />);
        expect(screen.getByText('Test Workspace')).toBeInTheDocument();
        expect(screen.getByText('A test workspace')).toBeInTheDocument();
        expect(screen.getByText('TE')).toBeInTheDocument(); // Initials
    });

    it('renders rendering in list view', () => {
        render(<WorkspaceItem {...mockProps} viewMode="list" />);
        expect(screen.getByText('Test Workspace')).toBeInTheDocument();
        expect(screen.getByText('Team')).toBeInTheDocument();
        expect(screen.getByText('Private')).toBeInTheDocument();
    });

    it('calls onToggleStar when star icon is clicked', () => {
        render(<WorkspaceItem {...mockProps} />);
        const starIcon = screen.getByTestId('icon-star');
        fireEvent.click(starIcon);
        expect(mockProps.onToggleStar).toHaveBeenCalledWith(expect.anything(), 'ws1');
    });

    it('calls setActiveMenuId when menu button is clicked', () => {
        render(<WorkspaceItem {...mockProps} />);
        const menuButton = screen.getByTestId('icon-more').closest('button');
        fireEvent.click(menuButton);
        expect(mockProps.setActiveMenuId).toHaveBeenCalledWith(expect.anything(), 'ws1');
    });

    it('renders menu when activeMenuId matches', () => {
        render(<WorkspaceItem {...mockProps} activeMenuId="ws1" />);
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });
});
