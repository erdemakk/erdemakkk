import { account, signer } from '$lib/store';
import { createWalletClient, custom } from 'viem';

export async function connectWallet() {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const walletClient = createWalletClient({
        transport: custom(window.ethereum)
      });

      const addresses = await walletClient.requestAddresses();
      const currentAccount = addresses?.[0] || '';

      account.set(currentAccount);
      signer.set(walletClient);

      window.ethereum.on?.('accountsChanged', (newAccounts) => {
        const next = (newAccounts && newAccounts[0]) || '';
        account.set(next);
        if (!next) {
          signer.set(null);
        } else {
          signer.set(walletClient);
        }
      });
    } catch (err) {
      console.error('Wallet connection error:', err);
      account.set('');
      signer.set(null);
    }
  } else {
    alert('MetaMask is not installed! Please install the MetaMask extension in your browser.');
  }
}
