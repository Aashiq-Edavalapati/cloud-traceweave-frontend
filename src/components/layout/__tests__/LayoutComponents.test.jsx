import { render } from '@testing-library/react';
import Header from '../Header';
import MainSidebar from '../MainSidebar';
import ResizablePanel from '../ResizablePanel';
import InviteMembersModal from '../InviteMembersModal';
import NewArtifactModal from '../NewArtifactModal';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

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
}));

// Mock portal-based components
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node) => node,
}));

// Mock UI/Child components
jest.mock('@/components/ui/Dropdown', () => {
  return function MockDropdown() {
    return <div data-testid="dropdown">Dropdown</div>;
  };
});

jest.mock('@/components/collections/SidebarCollections', () => {
  return function DummySidebarCollections() {
    return <div data-testid="sidebar-collections">Collections</div>;
  };
});

jest.mock('@/components/environments/SidebarEnvironments', () => {
  return function DummySidebarEnvironments() {
    return <div data-testid="sidebar-environments">Environments</div>;
  };
});

jest.mock('@/components/history/SidebarHistory', () => {
  return function DummySidebarHistory() {
    return <div data-testid="sidebar-history">History</div>;
  };
});

jest.mock('@/components/monitors/SidebarMonitors', () => {
  return function DummySidebarMonitors() {
    return <div data-testid="sidebar-monitors">Monitors</div>;
  };
});

jest.mock('../NewArtifactModal', () => {
  return function DummyNewArtifactModal() {
    return <div data-testid="new-artifact-modal">NewArtifactModal</div>;
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, animate, initial, exit, layoutId, ...props }) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, whileHover, whileTap, animate, initial, exit, layoutId, onClick, ...props }) => (
      <button onClick={onClick} {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock useAppStore
jest.mock('@/store/useAppStore', () => ({
  useAppStore: (selector) => {
    const store = {
      activeSidebarItem: 'dashboard',
      setActiveView: jest.fn(),
      availableWorkspaces: [],
      activeWorkspaceId: 'test-workspace-id',
      isLoadingWorkspaces: false,
      fetchWorkspaces: jest.fn(),
      availableEnvironments: [],
      fetchEnvironments: jest.fn(),
      getWorkspaceEnvironments: () => [],
      selectedEnvIndex: -1,
      user: { name: 'Test User' },
      setIsInviteOpen: jest.fn(),
      setSidebarWidth: jest.fn(),
    };
    return selector ? selector(store) : store;
  },
}));

// Mock useAuthStore
jest.mock('@/store/useAuthStore', () => ({
  useAuthStore: (selector) => {
    const store = {
      user: { name: 'Test User', email: 'test@example.com' },
      logout: jest.fn(),
    };
    return selector ? selector(store) : store;
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <span data-testid="icon-search" />,
  Layers: () => <span data-testid="icon-layers" />,
  Layout: () => <span data-testid="icon-layout" />,
  Eye: () => <span data-testid="icon-eye" />,
  Briefcase: () => <span data-testid="icon-briefcase" />,
  UserPlus: () => <span data-testid="icon-user-plus" />,
  Home: () => <span data-testid="icon-home" />,
  LogOut: () => <span data-testid="icon-logout" />,
  Settings: () => <span data-testid="icon-settings" />,
  Menu: () => <span data-testid="icon-menu" />,
  X: () => <span data-testid="icon-x" />,
  ChevronDown: () => <span data-testid="icon-chevron-down" />,
  Plus: () => <span data-testid="icon-plus" />,
  Copy: () => <span data-testid="icon-copy" />,
  Users: () => <span data-testid="icon-users" />,
  MessageSquare: () => <span data-testid="icon-message" />,
  Archive: () => <span data-testid="icon-archive" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Download: () => <span data-testid="icon-download" />,
  Upload: () => <span data-testid="icon-upload" />,
  FolderPlus: () => <span data-testid="icon-folder-plus" />,
  Activity: () => <span data-testid="icon-activity" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  Globe: () => <span data-testid="icon-globe" />,
  ChevronsRight: () => <span data-testid="icon-chevrons-right" />,
  MoreVertical: () => <span data-testid="icon-more" />,
  Trash: () => <span data-testid="icon-trash-2" />,
  Clock: () => <span data-testid="icon-clock" />,
  Box: () => <span data-testid="icon-box" />,
}));

describe('Layout Components', () => {
  const COMPONENTS = [
    { name: 'Header', Component: Header },
    { name: 'MainSidebar', Component: MainSidebar },
    { name: 'ResizablePanel', Component: ResizablePanel },
  ];

  COMPONENTS.forEach(({ name, Component }) => {
    it(`${name} renders without crashing`, () => {
      const { container } = render(<Component />);
      expect(container).toBeTruthy();
    });
  });

  it('InviteMembersModal renders without crashing', () => {
    const { container } = render(<InviteMembersModal open={true} onClose={() => {}} />);
    expect(container).toBeTruthy();
  });

  it('NewArtifactModal renders without crashing', () => {
    const { container } = render(<NewArtifactModal open={true} onClose={() => {}} />);
    expect(container).toBeTruthy();
  });
});