import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPanel from '../DashboardPanel';

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
}));

// Mock Recharts RecursiveContainer and Charts to avoid complex SVG issues and ResizeObserver strictness
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    // Wrap children in <svg> so JSDOM recognizes SVG-specific tags like <defs>
    AreaChart: ({ children }) => <svg data-testid="area-chart">{children}</svg>,
    Area: () => <g />,
    XAxis: () => <g />,
    YAxis: () => <g />,
    CartesianGrid: () => <g />,
    Tooltip: () => <g />,
    BarChart: ({ children }) => <svg data-testid="bar-chart">{children}</svg>,
    Bar: () => <g />,
    Cell: () => <g />,
    ReferenceLine: () => <g />,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Activity: () => <span data-testid="icon-activity" />,
  Clock: () => <span data-testid="icon-clock" />,
  Zap: () => <span data-testid="icon-zap" />,
  AlertTriangle: () => <span data-testid="icon-alert" />,
  Server: () => <span data-testid="icon-server" />,
  ArrowUpRight: () => <span data-testid="icon-arrow-up" />,
  ArrowDownRight: () => <span data-testid="icon-arrow-down" />,
}));

// Mock dashboard panel components
jest.mock('../dashboard_panel_components/MetricCard', () => ({
  MetricCard: ({ title, value, unit }) => (
    <div data-testid="metric-card">
      <span>{title}</span>
      <span>{value}</span>
      {unit && <span>{unit}</span>}
    </div>
  ),
}));

jest.mock('../dashboard_panel_components/CustomTooltip', () => ({
  CustomTooltip: () => <div data-testid="custom-tooltip" />,
}));

describe('DashboardPanel Component', () => {
    it('renders the main heading', async () => {
        render(<DashboardPanel />);

        // Wait for the component to mount and render the main title
        await waitFor(() => {
            expect(screen.getByText('Performance Hub')).toBeInTheDocument();
        });
    });

    it('renders all 4 metric cards', async () => {
        render(<DashboardPanel />);
        
        // Wait for the mounted state
        await waitFor(() => {
            expect(screen.getByText('Performance Hub')).toBeInTheDocument();
        });

        expect(screen.getByText('AVG LATENCY')).toBeInTheDocument();
        expect(screen.getByText('THROUGHPUT')).toBeInTheDocument();
        expect(screen.getByText('ERROR RATE')).toBeInTheDocument();
        expect(screen.getByText('NODES ACTIVE')).toBeInTheDocument();
    });

    it('renders the charts', async () => {
        render(<DashboardPanel />);
        
        // Wait for the mounted state
        await waitFor(() => {
            expect(screen.getByText('Performance Hub')).toBeInTheDocument();
        });

        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('renders the endpoints table correctly', async () => {
        render(<DashboardPanel />);
        
        // Wait for the mounted state
        await waitFor(() => {
            expect(screen.getByText('Performance Hub')).toBeInTheDocument();
        });

        expect(screen.getByText('/v1/payments/checkout')).toBeInTheDocument();
        expect(screen.getByText('/v1/users/profile')).toBeInTheDocument();
    });
});
