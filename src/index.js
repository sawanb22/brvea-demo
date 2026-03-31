import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import '@rainbow-me/rainbowkit/styles.css';
import { Buffer } from 'buffer'


import {
  getDefaultWallets,
  RainbowKitProvider,
  // AvatarComponent,
  
  lightTheme
} from '@rainbow-me/rainbowkit';
import { createClient, WagmiConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public'

import {
  // mainnet,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";


const queryClient = new QueryClient();

let color = {
  accentColor: '#6a6a6a',
  accentColorForeground: 'white',
  fontStack: 'rounded',
  overlayBlur: 'large',
}

// -----------------------------------------------------------------
// PREVIOUS ACTIVE CHAIN (BSC TESTNET) - kept for rollback.
// To rollback: comment baseSepolia below and use bscTest in configureChains.
// -----------------------------------------------------------------
// const bscTest = {
//   id: 97,
//   name: 'BSC Testnet',
//   network: 'Binance Smart Chain Testnet',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'tBNB',
//     symbol: 'tBNB',
//   },
//   iconUrl: '',
//   rpcUrls: {
//     default: 'https://data-seed-prebsc-1-s2.binance.org:8545',
//   },
//   blockExplorers: {
//     default: { name: 'BscScan TestNet', url: 'https://testnet.bscscan.com' },
//   },
//   testnet: true,
// }

// -----------------------------------------------------------------
// ACTIVE CHAIN (BASE SEPOLIA)
// -----------------------------------------------------------------
const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  iconUrl: '',
  rpcUrls: {
    default: 'https://sepolia.base.org',
  },
  blockExplorers: {
    default: { name: 'BaseScan Sepolia', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
}


const { chains, provider, webSocketProvider } = configureChains([
  // bscTest
  baseSepolia
], [
  publicProvider(),
]);
const { connectors } = getDefaultWallets({
  appName: 'BRAVEA App',
  chains
});

const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
})

// polyfill Buffer for client
if (!window.Buffer) {
  window.Buffer = Buffer
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme(color)} chains={chains}>
        <App />
        </RainbowKitProvider>
      </QueryClientProvider>
      </WagmiConfig>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
