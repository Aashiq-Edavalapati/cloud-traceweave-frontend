import '@testing-library/jest-dom'

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    useParams: () => ({
        workspaceId: 'test-workspace-id',
    }),
    useSearchParams: () => new URLSearchParams(),
}))

// Mock ModalProvider and useModal
jest.mock('@/components/providers/ModalProvider', () => ({
    ModalProvider: ({ children }) => <>{children}</>,
    useModal: () => ({
        openModal: jest.fn(),
        closeModal: jest.fn(),
    }),
}))
