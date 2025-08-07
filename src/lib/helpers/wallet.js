import { ethers } from 'ethers';
import { account, signer } from '$lib/store';

export async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Metamask provider'ı kullanarak bir ethers sağlayıcısı (provider) oluşturun
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Kullanıcıdan hesaplarına erişim izni isteyin
      const accounts = await provider.send("eth_requestAccounts", []);
      const currentAccount = accounts[0];

      // Hesap ve signer nesnelerini store'a kaydedin
      account.set(currentAccount);
      signer.set(provider.getSigner());

      // Hesap değiştiğinde store'u güncellemek için dinleme yapın
      // Bu kısım sorununuzu çözecek olan kısımdır.
      window.ethereum.on('accountsChanged', (newAccounts) => {
        account.set(newAccounts[0] || '');
        if (newAccounts.length === 0) {
          signer.set(null);
        } else {
          signer.set(provider.getSigner());
        }
      });

    } catch (err) {
      console.error("Cüzdan bağlantı hatası:", err);
      account.set('');
      signer.set(null);
    }
  } else {
    alert('MetaMask yüklü değil! Lütfen tarayıcınıza MetaMask eklentisini kurun.');
  }
}