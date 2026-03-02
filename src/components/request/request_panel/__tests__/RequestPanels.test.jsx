import { render } from '@testing-library/react';
import GraphqlRequestPanel from '../GraphqlRequestPanel';
import GrpcRequestPanel from '../GrpcRequestPanel';
import HttpRequestPanel from '../HttpRequestPanel';
import WebSocketRequestPanel from '../WebSocketRequestPanel';

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

// Mock uuid before any imports
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-v4',
}));

// Mock heavy markdown dependencies
jest.mock('@uiw/react-md-editor', () => ({
  __esModule: true,
  default: () => <div data-testid="md-editor" />,
}));

jest.mock('@uiw/react-markdown-preview', () => ({
  __esModule: true,
  default: () => <div data-testid="md-preview" />,
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Send: () => <span data-testid="icon-send" />,
  Copy: () => <span data-testid="icon-copy" />,
  Plus: () => <span data-testid="icon-plus" />,
  X: () => <span data-testid="icon-x" />,
  Settings: () => <span data-testid="icon-settings" />,
  Play: () => <span data-testid="icon-play" />,
  Code: () => <span data-testid="icon-code" />,
  Save: () => <span data-testid="icon-save" />,
  Loader2: () => <span data-testid="icon-loader2" />,
  Zap: () => <span data-testid="icon-zap" />,
  FileJson: () => <span data-testid="icon-file-json" />,
  ArrowRightLeft: () => <span data-testid="icon-arrow-right-left" />,
  Box: () => <span data-testid="icon-box" />,
  Activity: () => <span data-testid="icon-activity" />,
  Check: () => <span data-testid="icon-check" />,
}));

// Mock child components
jest.mock('@/components/request/ProtocolSwitcher', () => {
  return function MockProtocolSwitcher() { return <div data-testid="protocol-switcher" />; };
});

jest.mock('../graphql/GraphqlHeader', () => {
  return function MockGraphqlHeader() { return <div data-testid="graphql-header" />; };
});

jest.mock('../http/HttpHeader', () => {
  return function MockHttpHeader() { return <div data-testid="http-header" />; };
});

jest.mock('../websocket/WsHeader', () => {
  return function MockWsHeader() { return <div data-testid="ws-header" />; };
});

jest.mock('@/components/request/ResponsePane', () => {
  return function MockResponsePane() { return <div data-testid="response-pane" />; };
});

jest.mock('@/components/request/AuthEditor', () => {
  return function MockAuthEditor() { return <div data-testid="auth-editor" />; };
});

jest.mock('@/components/request/HeadersEditor', () => {
  return function MockHeadersEditor() { return <div data-testid="headers-editor" />; };
});

jest.mock('@/components/request/CookiesEditor', () => {
  return function MockCookiesEditor() { return <div data-testid="cookies-editor" />; };
});

// FIXED PATH HERE
jest.mock('../../CookieManagerModal', () => {
  return function MockCookieManagerModal() { return <div data-testid="cookie-manager" />; };
});

jest.mock('@/components/request/SaveRequestModal', () => {
  return function MockSaveRequestModal() { return <div data-testid="save-request-modal" />; };
});

jest.mock('../graphql/SchemaViewer', () => {
  return function MockSchemaViewer() { return <div data-testid="schema-viewer" />; };
});

jest.mock('@/components/request/NotesEditor', () => {
  return function MockNotesEditor() { return <div data-testid="notes-editor" />; };
});

jest.mock('@monaco-editor/react', () => {
  return function MockMonacoEditor() { return <div data-testid="monaco-editor" />; };
});

jest.mock('@/components/ui/Tabs', () => ({
  Tabs: function MockTabs({ tabs, activeTab, onTabClick }) { 
    return <div data-testid="tabs">{tabs && tabs[0]}</div>; 
  },
}));

// Mock WebSocket components
jest.mock('../websocket/WsHeader', () => {
  return function MockWsHeader() { return <div data-testid="ws-header" />; };
});

jest.mock('../websocket/WsComposer', () => {
  return function MockWsComposer() { return <div data-testid="ws-composer" />; };
});

jest.mock('../websocket/WsLogsPanel', () => {
  return function MockWsLogsPanel() { return <div data-testid="ws-logs-panel" />; };
});

jest.mock('../websocket/ResizeHandle', () => {
  return function MockResizeHandle() { return <div data-testid="resize-handle" />; };
});

jest.mock('@/components/request/ParamsEditor', () => {
  return function MockParamsEditor() { return <div data-testid="params-editor" />; };
});

// Mock graphql/http headers
jest.mock('../graphql/GraphqlHeader', () => {
  return function MockGraphqlHeader() { return <div data-testid="graphql-header" />; };
});

jest.mock('../http/HttpHeader', () => {
  return function MockHttpHeader() { return <div data-testid="http-header" />; };
});

// Mock useAppStore
jest.mock('@/store/useAppStore', () => ({
  useAppStore: (selector) => {
    const store = {
      selectedRequest: null,
      activeWorkspaceId: 'test-workspace-id',
      requestStates: {
        'test-request-id': { config: { url: 'http://localhost:3000', method: 'GET' } },
      },
      unsavedRequests: new Set(),
      collections: [],
      updateRequestState: jest.fn(),
      executeRequest: jest.fn(),
    };
    return selector ? selector(store) : store;
  },
}));

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
}));

describe('Request Panel Components', () => {
  it('GraphQL request panel renders without crashing', () => {
    const { container } = render(<GraphqlRequestPanel />);
    expect(container).toBeTruthy();
  });

  it('gRPC request panel renders without crashing', () => {
    const { container } = render(<GrpcRequestPanel />);
    expect(container).toBeTruthy();
  });

  it('HTTP request panel renders without crashing', () => {
    const { container } = render(<HttpRequestPanel />);
    expect(container).toBeTruthy();
  });

  it('WebSocket request panel renders without crashing', () => {
    const { container } = render(<WebSocketRequestPanel />);
    expect(container).toBeTruthy();
  });
});