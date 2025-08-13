<script>
  import { onMount } from 'svelte';
  import { account, balances, tradeHistory, initialBalance, signer } from '$lib/store';
  import { connectWallet } from '$lib/helpers/wallet';
  import { get } from 'svelte/store';
  import SwapInput from './SwapInput.svelte';
  import { parseUnits, formatUnits } from 'viem';

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
      coins = data.map(c => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        image: c.image,
        usd: c.current_price
      }));
    } catch (err) {
      coins = [];
    }
    recalculate();
  });

    const SCALE = 1_000_000n;
    const DECIMALS = 18;

    const toBigIntSafe = (v) => {
      if (typeof v === 'bigint') return v;
      if (typeof v === 'number') return BigInt(Math.trunc(v));
      if (typeof v === 'string') return v.length ? BigInt(v) : 0n;
      return 0n;
    };

  const recalculate = () => {
    const from = coins.find(c => c.id === fromCoin);
    const to = coins.find(c => c.id === toCoin);
    if (!from || !to) return;

    const rate = from.usd / to.usd; // number
    exchangeRate = rate;

    if (activeInput === "from" && amount && parseFloat(amount) > 0) {
      try {
        const amountBI = parseUnits(amount, DECIMALS);
        const rateBI = BigInt(Math.floor(rate * 1e6));
        const resultBI = (amountBI * rateBI) / SCALE;
        result = formatUnits(resultBI, DECIMALS);
      } catch (err) {
        result = '';
      }
    } else if (activeInput === 'to' && result && parseFloat(result) > 0) {
      try {
        const resultBI = parseUnits(result, DECIMALS);
        const inverseRateBI = BigInt(Math.floor((1 / rate) * 1e6));
        const amountBI = (resultBI * inverseRateBI) / SCALE;
        amount = formatUnits(amountBI, DECIMALS);
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
    balances.set(initialBalance);
  };

  const fakeSwap = async () => {
    if (!amount || parseFloat(amount) <= 0 || !result || !$account) {
      alert('Lütfen geçerli bir miktar girin ve cüzdanınızı bağlayın.');
      return;
    }
    try {
      if (!$signer) {
        alert("Lütfen önce cüzdanınızı bağlayın.");
        return;
      }
      await $signer.signMessage({
        account: $account,
        message: `Swap işlemi için onay verin: ${amount} ${fromCoin.toUpperCase()} -> ${result} ${toCoin.toUpperCase()}`
      });
    } catch (err) {
      alert("İmza işlemi iptal edildi.");
      return;
    }
    try {
      const amtBI = parseUnits(amount, DECIMALS);
      const resBI = parseUnits(result, DECIMALS);

      const currentBalances = get(balances);
      const fromBalanceBI = toBigIntSafe(currentBalances[fromCoin] ?? 0n);
      const toBalanceBI = toBigIntSafe(currentBalances[toCoin] ?? 0n);

      if (fromBalanceBI < amtBI) {
        alert(`Yetersiz ${fromCoin.toUpperCase()} bakiyesi.`);
        return;
      }

      const updated = { ...currentBalances };
      updated[fromCoin] = fromBalanceBI - amtBI;
      updated[toCoin] = toBalanceBI + resBI;

      balances.set(updated);

      tradeHistory.update(list => [
        { from: fromCoin, to: toCoin, amount: parseFloat(amount), result: parseFloat(result) },
        ...list
      ]);

      successMessage = `Swapped ${amount} ${fromCoin.toUpperCase()} → ${result} ${toCoin.toUpperCase()}`;
      showSuccess = true;
      setTimeout(() => (showSuccess = false), 3000);
      amount = '';
      result = '';
    } catch (err) {
      console.error('Swap error:', err);
    }
  };
</script>

<div class="relative bg-zinc-800/80 text-gray-200 p-6 rounded-3xl shadow-2xl space-y-4 max-w-sm mx-auto border border-zinc-700">

  <div class="flex justify-center items-center mb-4">
    <h2 class="text-xl font-bold text-white text-center">Swap</h2>
  </div>

  <div class="p-4 bg-zinc-700 rounded-2xl border border-transparent hover:border-purple-600 transition-colors duration-200">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm text-gray-400"></span>
    </div>
    <SwapInput
      bind:selected={fromCoin}
      bind:amount={amount}
      {coins}
      label="Sell"
      on:input={() => handleInput('from')}
      on:change={handleCoinChange}
    />
  </div>

  <div class="flex justify-center my-2">
    <button
      class="bg-zinc-600 hover:bg-zinc-500 text-purple-400 rounded-full p-2 transition transform hover:rotate-180 duration-300 shadow-md border border-zinc-700 z-20"
      on:click={swapDirection}
      aria-label="Swap direction"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5v14M19 12l-7 7-7-7"/>
      </svg>
    </button>
  </div>

  <div class="p-4 bg-zinc-700 rounded-2xl border border-transparent hover:border-purple-600 transition-colors duration-200">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm text-gray-400"></span>
    </div>
    <SwapInput
      bind:selected={toCoin}
      bind:amount={result}
      {coins}
      label="Buy"
      on:input={() => handleInput('to')}
      on:change={handleCoinChange}
    />
  </div>

  {#if exchangeRate}
    <div class="text-xs text-gray-400 flex justify-between">
      <span>Price</span>
      <span>1 {fromCoin.toUpperCase()} = {exchangeRate.toFixed(6)} {toCoin.toUpperCase()}</span>
    </div>
  {/if}

  <button
    class="w-full py-3 rounded-2xl text-lg font-semibold transition-colors duration-200
      disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-gray-500
      bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
    on:click={() => {
      if (!$account) handleWalletConnect();
      else fakeSwap();
    }}
    disabled={!result}
  >
    {$account ? 'Swap' : 'Connect Wallet'}
  </button>

  {#if showSuccess}
    <div class="mt-4 p-4 text-sm text-green-200 bg-green-800 rounded-2xl text-center shadow-inner animate-pulse">
      {successMessage}
    </div>
  {/if}
</div>
