import { writable } from 'svelte/store';

export const account = writable('');
export const signer = writable(null); // Bu satırı ekleyin
export const balances = writable({});
export const tradeHistory = writable([]);

export const initialBalance = {
  tether: 2000000000000000000000n, // 2000 adet Tether
  bitcoin: 50000000000000000000n,   // 50 adet Bitcoin
  ethereum: 200000000000000000000n  // 200 adet Ethereum
};

export function logout() {
  account.set('');
  balances.set({});
  tradeHistory.set([]);
}