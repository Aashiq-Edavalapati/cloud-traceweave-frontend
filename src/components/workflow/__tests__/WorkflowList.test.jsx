import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkflowList from '../WorkflowList';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
    useParams: () => ({
        workspaceId: 'test-workspace',
    }),
}));

// Mock the store
const mockFetchWorkspacesWorkflows = jest.fn();
const mockCreateWorkflow = jest.fn();
const mockDeleteWorkflow = jest.fn();
const mockRenameWorkflow = jest.fn();
const mockToggleWorkflowPin = jest.fn();
const mockDuplicateWorkflow = jest.fn();
const mockExecuteWorkflow = jest.fn();
const mockFetchWorkflowHistory = jest.fn();

let mockWorkflows = [
    {
        id: 'wf-1',
        name: 'First Workflow',
        description: 'A test workflow 1',
        pinned: false,
        executions: [{ status: 'SUCCESS', startedAt: new Date().toISOString() }]
    },
    {
        id: 'wf-2',
        name: 'Second Workflow',
        description: 'A test workflow 2',
        pinned: true,
        executions: [{ status: 'FAILED', startedAt: new Date().toISOString() }]
    }
];

jest.mock('@/store/useAppStore', () => ({
    useAppStore: () => ({
        workflows: mockWorkflows,
        fetchWorkspacesWorkflows: mockFetchWorkspacesWorkflows,
        createWorkflow: mockCreateWorkflow,
        deleteWorkflow: mockDeleteWorkflow,
        renameWorkflow: mockRenameWorkflow,
        toggleWorkflowPin: mockToggleWorkflowPin,
        duplicateWorkflow: mockDuplicateWorkflow,
        executeWorkflow: mockExecuteWorkflow,
        fetchWorkflowHistory: mockFetchWorkflowHistory,
    }),
}));

// Mock ModalProvider
const mockShowAlert = jest.fn();
const mockShowPrompt = jest.fn((title, submitAction) => submitAction('Test Workflow Name'));
const mockShowConfirm = jest.fn((title, confirmAction) => confirmAction());

jest.mock('@/components/providers/ModalProvider', () => ({
    useModal: () => ({
        showAlert: mockShowAlert,
        showPrompt: mockShowPrompt,
        showConfirm: mockShowConfirm,
    }),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, layout, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock lucide icons to simplify DOM
jest.mock('lucide-react', () => {
    const React = require('react');
    return new Proxy({}, {
        get: function (target, prop) {
            return ({ className, onClick }) => React.createElement('span', { 'data-testid': `icon-${prop}`, className, onClick });
        }
    });
});

// Mock LogStreamSidebar
jest.mock('../LogStreamSidebar', () => {
    return function MockLogStreamSidebar({ workflowId, onClose }) {
        return <div data-testid="log-stream-sidebar">{workflowId} <button onClick={onClose}>Close</button></div>;
    }
});

// Mock format utils
jest.mock('@/utils/format', () => ({
    formatTimeAgo: () => '2 mins ago',
}));

describe('WorkflowList Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly and fetches workflows on mount', async () => {
        render(<WorkflowList />);

        expect(screen.getByText('Visual Workflows')).toBeInTheDocument();
        expect(mockFetchWorkspacesWorkflows).toHaveBeenCalledWith('test-workspace');

        // Check if workflows are rendered
        expect(screen.getByText('First Workflow')).toBeInTheDocument();
        expect(screen.getByText('Second Workflow')).toBeInTheDocument();
    });

    it('handles search input correctly', () => {
        render(<WorkflowList />);

        const searchInput = screen.getByPlaceholderText('Quick search...');
        fireEvent.change(searchInput, { target: { value: 'Second' } });

        expect(screen.queryByText('First Workflow')).not.toBeInTheDocument();
        expect(screen.getByText('Second Workflow')).toBeInTheDocument();
    });

    it('handles status filter correctly', () => {
        render(<WorkflowList />);

        // Initial ALL
        expect(screen.getByText('First Workflow')).toBeInTheDocument();
        expect(screen.getByText('Second Workflow')).toBeInTheDocument();

        // Filter SUCCESS
        fireEvent.click(screen.getByRole('button', { name: 'SUCCESS' }));
        expect(screen.getByText('First Workflow')).toBeInTheDocument();
        expect(screen.queryByText('Second Workflow')).not.toBeInTheDocument();

        // Filter FAILED
        fireEvent.click(screen.getByRole('button', { name: 'FAILED' }));
        expect(screen.queryByText('First Workflow')).not.toBeInTheDocument();
        expect(screen.getByText('Second Workflow')).toBeInTheDocument();
    });

    it('handles favorites filter correctly', () => {
        render(<WorkflowList />);

        // Ensure both are present initially
        expect(screen.getByText('First Workflow')).toBeInTheDocument();
        expect(screen.getByText('Second Workflow')).toBeInTheDocument();

        const favButton = screen.getByText('FAVORITES');
        fireEvent.click(favButton);

        // Only 'Second Workflow' is pinned in our mock
        expect(screen.queryByText('First Workflow')).not.toBeInTheDocument();
        expect(screen.getByText('Second Workflow')).toBeInTheDocument();
    });

    it('calls createWorkflow via showPrompt when New Workflow is clicked', () => {
        render(<WorkflowList />);

        const newWfButton = screen.getByText('New Workflow');
        fireEvent.click(newWfButton);

        expect(mockShowPrompt).toHaveBeenCalled();
        expect(mockCreateWorkflow).toHaveBeenCalledWith('test-workspace', 'Test Workflow Name');
    });
});
