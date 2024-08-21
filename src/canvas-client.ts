import { CanvasClient } from '@dscvr-one/canvas-client-sdk';
import { registerCanvasWallet } from '@dscvr-one/canvas-wallet-adapter';
import type { WalletName } from '@solana/wallet-adapter-base';

export const checkIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

export const isIframe = checkIframe();
export const canvasClient = isIframe ? new CanvasClient() : undefined;
const canvasWallet = canvasClient
  ? registerCanvasWallet(canvasClient)
  : undefined;

export const CANVAS_WALLET_NAME = canvasWallet
  ? (canvasWallet.name as WalletName)
  : undefined;
