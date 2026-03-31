import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as wagmi from 'wagmi';
import useCustomContractRead from '../../Hooks/useCustomContractRead';

jest.mock('react-slick', () => ({ children }) => <div>{children}</div>);

jest.mock('./Hero', () => ({
  Hero: () => <div>Hero Section</div>,
}));

jest.mock('../../Hooks/useCustomContractRead');

jest.mock('wagmi');

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => jest.fn(),
  };
});

let Home;

describe('Home page', () => {
  beforeAll(() => {
    Home = require('./Home').Home;
  });

  beforeEach(() => {
    wagmi.useAccount.mockReturnValue({ address: '0xabc', isConnected: true });
    wagmi.useBalance.mockReturnValue({ data: undefined });
    wagmi.useContractRead.mockReturnValue({ data: { _collateralRatio: '0' } });
    wagmi.useToken.mockImplementation(({ address }) => ({
      data: {
        symbol: address ? 'TOKEN' : '',
        totalSupply: { formatted: '0' },
      },
    }));

    useCustomContractRead.mockImplementation(({ FuncName }) => {
      if (FuncName === 'getYTokenPrice') {
        return { data: '0' };
      }

      if (FuncName === 'getXTokenPrice') {
        return { data: '0' };
      }

      if (FuncName === 'getXTokenTWAP') {
        return { data: '0' };
      }

      if (FuncName === 'blockTimestampLast') {
        return { data: '0' };
      }

      if (FuncName === 'lastRefreshCrTimestamp') {
        return { data: '0' };
      }

      return { data: undefined };
    });
  });

  test('renders safe fallback values without NaN or Infinity', () => {
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Hero Section')).toBeInTheDocument();
    expect(container.textContent).toMatch(/Last Update:\s*NA/);
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
  });
});
