import {
  StellarWalletsKit,
  Networks,
} from '@creit.tech/stellar-wallets-kit';
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';

let isInitialized = false;

const initKit = () => {
  if (typeof window !== 'undefined' && !isInitialized) {
    StellarWalletsKit.init({
      network: Networks.TESTNET,
      modules: defaultModules(),
    });
    isInitialized = true;
  }
};

/**
 * Open the wallet connection modal, let the user select a wallet,
 * retrieve their public Stellar address, and return it.
 */
export const connectStellarWallet = async (): Promise<string> => {
  initKit();
  const { address } = await StellarWalletsKit.authModal();
  return address;
};

/**
 * Disconnect the wallet by clearing the current selection in the kit.
 */
export const disconnectStellarWallet = async () => {
  try {
    initKit();
    await StellarWalletsKit.disconnect();
  } catch (err) {
    console.error('Failed to disconnect wallet:', err);
  }
};
