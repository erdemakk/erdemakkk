<script>
  import { onMount } from 'svelte';
  import { account, balances, tradeHistory, initialBalance, signer } from '$lib/store';
  import { connectWallet } from '$lib/helpers/wallet';
  import { get } from 'svelte/store';
  import SwapInput from './SwapInput.svelte';
  import { ethers } from 'ethers';

  let coins = [];
  let fromCoin = 'tether';
  let toCoin = 'ethereum';
  let amount = '';
  let result = '';
  let exchangeRate = null;
  let successMessage = '';
  let showSuccess = false;
  let activeInput = 'to';

  onMount(async () => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=30&page=1");
      const data = await res.json();
      console.log('API\'den gelen veri:', data);
      coins = data.map(c => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        image: c.image,
        usd: c.current_price
      }));
    } catch (err) {
      console.error('Failed to fetch coin data:', err);
      coins = [];
    }

    recalculate();
  });

  const recalculate = () => {
    const from = coins.find(c => c.id === fromCoin);
    const to = coins.find(c => c.id === toCoin);
    if (!from || !to) return;

    const rate = from.usd / to.usd;
    exchangeRate = rate;

    if (activeInput === 'from' && amount && parseFloat(amount) > 0) {
      try {
        const amountBN = ethers.utils.parseEther(amount);
        const rateBN = ethers.BigNumber.from(Math.floor(rate * 1e6));
        const resultBN = amountBN.mul(rateBN).div(ethers.BigNumber.from(1e6));
        result = ethers.utils.formatEther(resultBN);
      } catch (err) {
        result = '';
      }
    } else if (activeInput === 'to' && result && parseFloat(result) > 0) {
      try {
        const resultBN = ethers.utils.parseEther(result);
        const inverseRateBN = ethers.BigNumber.from(Math.floor((1 / rate) * 1e6));
        const amountBN = resultBN.mul(inverseRateBN).div(ethers.BigNumber.from(1e6));
        amount = ethers.utils.formatEther(amountBN);
      } catch (err) {
        amount = '';
      }
    } else {
      amount = '';
      result = '';
    }
  };

  const handleInput = (type) => {
    activeInput = type;
    recalculate();
  };

  const handleCoinChange = () => recalculate();

  const swapDirection = () => {
    [fromCoin, toCoin] = [toCoin, fromCoin];
    [amount, result] = [result, amount];
    activeInput = activeInput === 'from' ? 'to' : 'from';
    recalculate();
  };

  const handleWalletConnect = async () => {
    await connectWallet();
    // Cüzdan bağlandığında bakiyeyi başlat.
    balances.set(initialBalance);
  };

  const fakeSwap = async () => {
    // İşlem için yeterli miktar ve hesap bağlı mı kontrolü.
    if (!amount || parseFloat(amount) <= 0 || !result || !$account) {
      alert('Lütfen geçerli bir miktar girin ve cüzdanınızı bağlayın.');
      return;
    }

    // 1. ADIM: Cüzdana imza isteği gönderme
    try {
      if (!$signer) {
        alert("Lütfen önce cüzdanınızı bağlayın.");
        return;
      }
      const message = `Swap işlemi için onay verin: ${amount} ${fromCoin.toUpperCase()} -> ${result} ${toCoin.toUpperCase()}`;
      const signature = await $signer.signMessage(message);
      console.log("İmza başarılı:", signature);

    } catch (err) {
      console.error("İmza işlemi iptal edildi veya bir hata oluştu:", err);
      alert("İmza işlemi iptal edildi.");
      return;
    }

    // 2. ADIM: Geri kalan swap mantığı (imza başarılıysa çalışır)
    try {
      const amtBN = ethers.utils.parseEther(amount);
      const resValBN = ethers.utils.parseEther(result);

      // Store'dan güncel bakiyeleri alın
      const currentBalances = get(balances);

      // Gönderilecek coinin bakiyesini BigNumber olarak alın.
      // Eğer bakiye yoksa (undefined), 0 BigNumber'ı kullanın.
      const fromBalanceBN = ethers.BigNumber.from(currentBalances[fromCoin] || '0');

      if (fromBalanceBN.lt(amtBN)) {
        alert(`Yetersiz ${fromCoin.toUpperCase()} bakiyesi.`);
        return;
      }

      // Yeni bakiyeleri hesaplayın
      const updated = { ...currentBalances };
      const newFromBN = fromBalanceBN.sub(amtBN);

      // Alınacak coinin mevcut bakiyesini BigNumber olarak alın.
      const toBalanceBN = ethers.BigNumber.from(currentBalances[toCoin] || '0');
      const newToBN = toBalanceBN.add(resValBN);

      // Güncellenmiş BigNumber bakiyelerini BigInt'e çevirerek store'a kaydedin
      // Not: ethers.BigNumber.toBigInt() fonksiyonu olmadığından,
      // value.toHexString() ile stringe çevirip BigInt() ile tekrar BigInt'e çeviriyoruz.
      // Ya da, daha basit bir şekilde, BigNumber'ı string'e çevirip store'a kaydedebiliriz.
      updated[fromCoin] = newFromBN;
      updated[toCoin] = newToBN;

      // Store'u güncellenmiş BigNumber nesneleriyle güncelleyin
      balances.set(updated);

      tradeHistory.update(list => [
        { from: fromCoin, to: toCoin, amount: parseFloat(amount), result: parseFloat(result) },
        ...list
      ]);

      successMessage = `Swapped ${amount} ${fromCoin.toUpperCase()} → ${result} ${toCoin.toUpperCase()}`;
      showSuccess = true;
      setTimeout(() => showSuccess = false, 3000);

      amount = '';
      result = '';

    } catch (err) {
      console.error('Swap error:', err);
    }
  };
</script>

<div class="relative bg-white p-6 rounded-xl shadow-md space-y-6 max-w-md mx-auto">
  <h2 class="text-xl font-bold text-center text-gray-800">Swap Coins</h2>

  <SwapInput
    bind:selected={fromCoin}
    bind:amount={amount}
    {coins}
    label="Sell"
    on:input={() => handleInput('from')}
    on:change={handleCoinChange}
  />

  <div class="flex justify-center">
    <button
      class="bg-gray-100 hover:bg-gray-200 text-xl rounded-full p-2 transition shadow"
      on:click={swapDirection}
      aria-label="Swap direction"
    >
      ⬇️
    </button>
  </div>

  <SwapInput
    bind:selected={toCoin}
    bind:amount={result}
    {coins}
    label="Buy"
    on:input={() => handleInput('to')}
    on:change={handleCoinChange}
  />

  <button
    class="w-full py-2 px-4 rounded text-white font-semibold transition
      disabled:cursor-not-allowed disabled:opacity-50
      bg-pink-500 hover:bg-pink-600"
    on:click={() => {
      if (!$account) handleWalletConnect();
      else fakeSwap();
    }}
    disabled={!result}
  >
    {$account ? 'Swap' : 'Connect MetaMask to swap'}
  </button>

  {#if showSuccess}
    <div class="mt-4 p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded text-center">
      {successMessage}
    </div>
  {/if}
</div>