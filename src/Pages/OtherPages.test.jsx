import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as wagmi from 'wagmi';
import useCustomContractRead from '../Hooks/useCustomContractRead';
import useCustomContractWrite from '../Hooks/useCustomContractWrite';
import useCheckAllowance from '../Hooks/useCheckAllowance';

jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useBalance: jest.fn(),
  useContractRead: jest.fn(),
  useContractReads: jest.fn(),
  useToken: jest.fn(),
}));
jest.mock('../Hooks/useCustomContractRead');
jest.mock('../Hooks/useCustomContractWrite');
jest.mock('../Hooks/useCheckAllowance');

jest.mock('@rainbow-me/rainbowkit', () => ({
  useConnectModal: () => ({
    openConnectModal: jest.fn(),
  }),
}));

jest.mock('../common/ApproveButton', () => () => <button>Approve</button>);
jest.mock('../Component/Common/Loader', () => () => <div>Loading</div>);
jest.mock('../Component/Common/Symbol', () => () => <div>Symbol</div>);
jest.mock('./Tools/Accordion', () => ({
  Accordion: () => <div>Accordion</div>,
}));

jest.mock('jquery', () => {
  const optionNode = {
    text: () => '',
    val: () => '0',
    is: () => false,
  };

  const childrenNode = {
    length: 0,
    eq: () => optionNode,
    click: () => childrenNode,
  };

  const chain = {};

  chain.addClass = () => chain;
  chain.wrap = () => chain;
  chain.after = () => chain;
  chain.next = () => chain;
  chain.text = () => chain;
  chain.insertAfter = () => chain;
  chain.appendTo = () => chain;
  chain.children = (selector) => (selector === 'option' ? childrenNode : chain);
  chain.click = () => chain;
  chain.toggleClass = () => chain;
  chain.toggle = () => chain;
  chain.hide = () => chain;
  chain.show = () => chain;
  chain.val = () => '0';
  chain.find = () => chain;
  chain.removeClass = () => chain;
  chain.not = () => chain;
  chain.is = () => false;
  chain.attr = () => '0';
  chain.each = (cb) => {
    if (typeof cb === 'function') {
      cb.call(chain, 0, chain);
    }
    return chain;
  };

  const jquery = () => chain;
  jquery.default = jquery;
  jquery.fn = chain;

  return jquery;
});

const renderPage = (Component) => {
  const { container } = render(
    <MemoryRouter>
      <Component />
    </MemoryRouter>
  );

  expect(container.querySelector('main')).toBeInTheDocument();
};

describe('Other pages smoke tests', () => {
  let Mint;
  let Redeem;
  let Stake;
  let StakeWithdraw;
  let Lock;
  let LockWithdraw;
  let Tool;

  beforeAll(() => {
    Mint = require('./Mint/Mint').Mint;
    Redeem = require('./Redeem/Redeem').Redeem;
    Stake = require('./Stake/Stake').Stake;
    StakeWithdraw = require('./Stake-Withdraw/Stake_withdraw').Stake_withdraw;
    Lock = require('./Lock/Lock').Lock;
    LockWithdraw = require('./Lock-Withdraw/Lock_withdraw').Lock_withdraw;
    Tool = require('./Tools/Tool').Tool;
  });

  beforeEach(() => {
    wagmi.useAccount.mockReturnValue({ address: '0xabc', isConnected: true });
    wagmi.useBalance.mockReturnValue({ data: { formatted: '0' } });
    wagmi.useContractRead.mockReturnValue({ data: undefined });
    wagmi.useContractReads.mockReturnValue({ data: [] });
    wagmi.useToken.mockReturnValue({ data: { address: '0x1', symbol: 'TKN', totalSupply: { formatted: '0' } } });

    useCheckAllowance.mockReturnValue({ data: '0' });

    useCustomContractRead.mockImplementation(({ FuncName }) => {
      if (FuncName === 'poolLength') {
        return { data: '0' };
      }
      if (FuncName === 'xToken' || FuncName === 'yToken') {
        return { data: '0x1' };
      }
      return { data: undefined };
    });

    useCustomContractWrite.mockReturnValue({
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
    });
  });

  test('Mint renders', () => {
    renderPage(Mint);
  });

  test('Redeem renders', () => {
    renderPage(Redeem);
  });

  test('Stake renders', () => {
    renderPage(Stake);
  });

  test('Stake withdraw renders', () => {
    renderPage(StakeWithdraw);
  });

  test('Lock renders', () => {
    renderPage(Lock);
  });

  test('Lock withdraw renders', () => {
    renderPage(LockWithdraw);
  });

  test('Tool renders', () => {
    renderPage(Tool);
  });
});
