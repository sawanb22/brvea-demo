import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as wagmi from 'wagmi';
import useCustomContractRead from '../../Hooks/useCustomContractRead';
import useCustomContractWrite from '../../Hooks/useCustomContractWrite';

jest.mock('../../Hooks/useCustomContractRead');
jest.mock('../../Hooks/useCustomContractWrite');
jest.mock('@rainbow-me/rainbowkit', () => ({
  useConnectModal: () => ({
    openConnectModal: jest.fn(),
  }),
}));

jest.mock('wagmi');

let Dashboard;

const deliveredCallbacks = new Set();

const once = (key, callback, payload) => {
  if (typeof callback !== 'function' || deliveredCallbacks.has(key)) {
    return;
  }

  deliveredCallbacks.add(key);
  Promise.resolve().then(() => callback(payload));
};

describe('Dashboard page', () => {
  beforeAll(() => {
    Dashboard = require('./Dashboard').Dashboard;
  });

  beforeEach(() => {
    deliveredCallbacks.clear();

    wagmi.useAccount.mockReturnValue({ address: '0xabc', isConnected: true });
    wagmi.useBalance.mockReturnValue({ data: undefined });
    wagmi.useContractRead.mockReturnValue({ data: undefined });
    wagmi.useToken.mockReturnValue({ data: undefined });

    useCustomContractRead.mockImplementation(({ FuncName, onSuccess }) => {
      if (FuncName === 'claimableRewards') {
        once('claimableRewards', onSuccess, [{ amount: '0' }, { amount: '0' }]);
        return { data: undefined };
      }

      if (FuncName === 'withdrawableBalance') {
        once('withdrawableBalance', onSuccess, {
          amount: '9999000000000000000000',
          penaltyAmount: '0',
        });
        return { data: undefined };
      }

      if (FuncName === 'earnedBalances') {
        return {
          data: {
            total: '0',
            earningsData: [],
          },
        };
      }

      if (FuncName === 'lockedBalances') {
        return {
          data: {
            lockData: [],
          },
        };
      }

      if (FuncName === 'totalSupply') {
        return { data: '19999000000000000000000' };
      }

      if (FuncName === 'lockedSupply') {
        return { data: '10000000000000000000000' };
      }

      if (FuncName === 'getYTokenPrice') {
        return { data: '1000000000000000000' };
      }

      return { data: undefined };
    });

    useCustomContractWrite.mockImplementation(() => ({
      _useContractWrite: {
        isLoading: false,
        writeAsync: jest.fn(),
      },
      _useWaitForTransaction: {
        isLoading: false,
      },
      _usePrepareContractWrite: {
        config: {},
      },
      _isPrepareConfigReady: true,
      _prepareErrorMessage: '',
    }));
  });

  test('shows unlocked staked value and claim-all scenario (0/0/0/10.00K)', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Unlocked BRVA Staked')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('10.00K')).toBeInTheDocument();
    });

    expect(screen.getByText('9999.00')).toBeInTheDocument();
    expect(screen.getByText('10000.00')).toBeInTheDocument();

    const claimButtons = screen.getAllByRole('button', { name: /^Claim$/i });
    expect(claimButtons).toHaveLength(2);
    expect(claimButtons[0]).toBeDisabled();
    expect(claimButtons[1]).not.toBeDisabled();
  });
});
