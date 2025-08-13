import { writable } from 'svelte/store';
export const account = writable('');
export const signer = writable(null);
export const balances = writable({});
export const tradeHistory = writable([]);

export const initialBalance = {
  tether:   2_000n * 10n ** 18n, // 2000 USDT (demo)
  bitcoin:     50n * 10n ** 18n, // 50 BTC  (demo)
  ethereum:   200n * 10n ** 18n  // 200 ETH (demo)
};

export function logout() {
  account.set('');
  signer.set(null);
  balances.set({});
  tradeHistory.set([]);
}
