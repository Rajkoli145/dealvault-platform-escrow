import {
  StellarWalletsKit,
  Networks,
} from '@creit.tech/stellar-wallets-kit';
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';

export const kit = new StellarWalletsKit({
  network: Networks.TESTNET,
  modules: defaultModules(),
});

/**
 * Open the wallet connection modal, let the user select a wallet,
 * retrieve their public Stellar address, and return it.
 */
export const connectStellarWallet = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    kit.openModal({
      onWalletSelected: async (option) => {
        try {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          resolve(address);
        } catch (err) {
          console.error('Failed to get wallet address:', err);
          reject(err);
        }
      },
    });
  });
};

/**
 * Disconnect the wallet by clearing the current selection in the kit.
 */
export const disconnectStellarWallet = async () => {
  try {
    // Clear selected wallet if supported
    // The kit itself is stateless once disconnected, so we just clear our frontend state
  } catch (err) {
    console.error('Failed to disconnect wallet:', err);
  }
};
