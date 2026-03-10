import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkflowCanvasWrapper from '../WorkflowCanvas';

// Mock nanoid (ESM issues with Jest)
jest.mock('nanoid', () => ({
    nanoid: () => 'mock-id'
}));

// Mock dependencies
const mockStoreState = {
    activeWorkflow: { id: 'test-wf', name: 'Test WF' },
    workspaceEnvironments: {},
    activeWorkspaceId: 'test-ws',
    selectedEnvIndex: 0,
    requestStates: {}
};

jest.mock('@/store/useAppStore', () => {
    const useAppStore = () => mockStoreState;
    useAppStore.getState = () => mockStoreState;
    return { useAppStore };
});

jest.mock('@/lib/api', () => ({
    api: {
        post: jest.fn().mockResolvedValue({ data: { success: true } })
    },
    WS_URL: 'ws://localhost:1234'
}));

// Mock ResizeObserver for ReactFlow
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock scrollIntoView (missing in JSDOM)
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// Mock WebSocket to avoid connection attempts during tests
global.WebSocket = class WebSocket {
    constructor() {
        this.close = jest.fn();
        this.send = jest.fn();
    }
};

// Mock lucide icons
jest.mock('lucide-react', () => {
    const React = require('react');
    return new Proxy({}, {
        get: function (target, prop) {
            return ({ className, onClick }) => React.createElement('span', { 'data-testid': `icon-${prop}`, className, onClick });
        }
    });
});

// Since @xyflow/react can be tricky to test deeply without real DOM layout,
// we mostly test the wrapper and UI controls around the canvas.
// For the purpose of these tests, we can render the real component, but if it throws due to 
// ResizeObserver or layout, we might need more mocks. The ReactFlowProvider and CanvasEditor 
// should render without crashing with the ResizeObserver mock.

describe('WorkflowCanvas Component', () => {
    const initialData = {
        nodes: [
            { id: 'start-1', type: 'startNode', position: { x: 100, y: 200 }, data: {} },
        ],
        edges: []
    };

    it('renders without crashing and shows terminal toggles', () => {
        render(<WorkflowCanvasWrapper initialData={initialData} />);

        // Check for Terminal toggle in status bar
        expect(screen.getByText(/Terminal/i)).toBeInTheDocument();

        // Check for initial nodes count in status bar
        // We mock ReactFlow rendering somehow, but let's check basic UI first
        expect(screen.getByText(/1 nodes/i)).toBeInTheDocument();
    });

    it('can toggle the terminal open and closed', () => {
        render(<WorkflowCanvasWrapper initialData={initialData} />);

        const terminalToggle = screen.getByText(/Terminal/i);

        // Terminal initially closed, let's open it
        fireEvent.click(terminalToggle);

        // Should show Output, Logs, Responses, Variables tabs
        expect(screen.getByText('Output')).toBeInTheDocument();
        expect(screen.getByText('Logs')).toBeInTheDocument();
        expect(screen.getByText('Responses')).toBeInTheDocument();
        expect(screen.getByText('Variables')).toBeInTheDocument();

        // Close terminal
        fireEvent.click(terminalToggle);
        expect(screen.queryByText('Output')).not.toBeInTheDocument();
    });

    it('can trigger a run', async () => {
        render(<WorkflowCanvasWrapper initialData={initialData} />);

        const runButton = screen.getByRole('button', { name: /Run/i });
        fireEvent.click(runButton);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Stop/i })).toBeInTheDocument();
            expect(screen.getByText('Output')).toBeInTheDocument();
        });
    });
});
