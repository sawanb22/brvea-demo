import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./Component/Common/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

jest.mock('./Component/Common/Animate', () => ({
  Animate: () => <div data-testid="animate" />,
}));

jest.mock('./Pages/Home/Home', () => ({
  Home: () => <main data-testid="home-page" />,
}));

jest.mock('./Pages/Mint/Mint', () => ({
  Mint: () => <main data-testid="mint-page" />,
}));

jest.mock('./Pages/Redeem/Redeem', () => ({
  Redeem: () => <main data-testid="redeem-page" />,
}));

jest.mock('./Pages/Tools/Tool', () => ({
  Tool: () => <main data-testid="tool-page" />,
}));

jest.mock('./Pages/Stake/Stake', () => ({
  Stake: () => <main data-testid="stake-page" />,
}));

jest.mock('./Pages/Stake-Withdraw/Stake_withdraw', () => ({
  Stake_withdraw: () => <main data-testid="stake-withdraw-page" />,
}));

jest.mock('./Pages/Lock/Lock', () => ({
  Lock: () => <main data-testid="lock-page" />,
}));

jest.mock('./Pages/Lock-Withdraw/Lock_withdraw', () => ({
  Lock_withdraw: () => <main data-testid="lock-withdraw-page" />,
}));

jest.mock('./Pages/Dashboard/Dashboard', () => ({
  Dashboard: () => <main data-testid="dashboard-page" />,
}));

const routes = [
  { path: '/', testId: 'home-page' },
  { path: '/mint', testId: 'mint-page' },
  { path: '/redeem', testId: 'redeem-page' },
  { path: '/farm', testId: 'tool-page' },
  { path: '/stake', testId: 'stake-page' },
  { path: '/stake-withdraw', testId: 'stake-withdraw-page' },
  { path: '/lock', testId: 'lock-page' },
  { path: '/lock-withdraw', testId: 'lock-withdraw-page' },
  { path: '/dashboard', testId: 'dashboard-page' },
];

describe('App route smoke coverage', () => {
  afterEach(() => {
    cleanup();
    window.history.pushState({}, '', '/');
  });

  test.each(routes)('renders %s without crashing', ({ path, testId }) => {
    window.history.pushState({}, '', path);

    render(<App />);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });
});
