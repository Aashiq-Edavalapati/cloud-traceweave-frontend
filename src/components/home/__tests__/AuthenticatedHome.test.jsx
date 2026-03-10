import React from 'react';
import { render } from '@testing-library/react';
import AuthenticatedHome from '../AuthenticatedHome';

/* ===== MOCK NEXT.JS NAVIGATION ===== */
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/workspace'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

/* ===== MOCK LAYOUT COMPONENTS (REAL FILES ONLY) ===== */
jest.mock('../../layout/Header', () => ({
  __esModule: true,
  default: () => <div>Header</div>,
}));

jest.mock('../../layout/MainSidebar', () => ({
  __esModule: true,
  default: () => <div>MainSidebar</div>,
}));

jest.mock('../../layout/ResizablePanel', () => ({
  __esModule: true,
  default: ({ children }) => <div>ResizablePanel{children}</div>,
}));

/* ===== MOCK DASHBOARD CONTENT ===== */
jest.mock('../../dashboard/DashboardPanel', () => ({
  __esModule: true,
  default: () => <div>DashboardPanel</div>,
}));

describe('AuthenticatedHome', () => {
  it('renders without crashing', () => {
    const { container } = render(<AuthenticatedHome />);
    expect(container).toBeTruthy();
  });
});
