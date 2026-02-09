import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ContextMenu from './ContextMenu';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Copy: () => <span data-testid="icon-copy" />,
    Edit2: () => <span data-testid="icon-edit" />,
    Trash2: () => <span data-testid="icon-trash" />,
    Pin: () => <span data-testid="icon-pin" />,
    PinOff: () => <span data-testid="icon-pinoff" />,
}));

describe('ContextMenu', () => {
    const mockProps = {
        x: 100,
        y: 100,
        onClose: jest.fn(),
        onRename: jest.fn(),
        onDuplicate: jest.fn(),
        onDelete: jest.fn(),
        isPinned: false,
        onPin: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly when x and y are provided', () => {
        render(<ContextMenu {...mockProps} />);
        expect(screen.getByText('Rename')).toBeInTheDocument();
    });

    it('does not render when x or y is null', () => {
        const { container } = render(<ContextMenu {...mockProps} x={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('calls onPin and renders correct text when pinned', () => {
        render(<ContextMenu {...mockProps} isPinned={true} />);
        expect(screen.getByText('Unpin')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Unpin'));
        expect(mockProps.onPin).toHaveBeenCalledTimes(1);
    });

    it('renders "Pin to Top" when not pinned', () => {
        render(<ContextMenu {...mockProps} isPinned={false} />);
        expect(screen.getByText('Pin to Top')).toBeInTheDocument();
    });

    it('calls onRename when clicked', () => {
        render(<ContextMenu {...mockProps} />);
        fireEvent.click(screen.getByText('Rename'));
        expect(mockProps.onRename).toHaveBeenCalledTimes(1);
    });

    it('calls onDuplicate when clicked', () => {
        render(<ContextMenu {...mockProps} />);
        fireEvent.click(screen.getByText('Duplicate'));
        expect(mockProps.onDuplicate).toHaveBeenCalledTimes(1);
    });

    it('calls onDelete when clicked', () => {
        render(<ContextMenu {...mockProps} />);
        fireEvent.click(screen.getByText('Delete'));
        expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when clicking outside', () => {
        render(
            <div>
                <div data-testid="outside">Outside</div>
                <ContextMenu {...mockProps} />
            </div>
        );
        fireEvent.mouseDown(screen.getByTestId('outside'));
        expect(mockProps.onClose).toHaveBeenCalled();
    });
});
