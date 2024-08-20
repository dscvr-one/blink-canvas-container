import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  WalletProvider,
  ConnectionProvider,
} from '@solana/wallet-adapter-react';
import App from './App.tsx';
import './index.css';

const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider wallets={[]}>
      <ConnectionProvider endpoint={RPC_ENDPOINT}>
        <App />
      </ConnectionProvider>
    </WalletProvider>
  </React.StrictMode>
);
