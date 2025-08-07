<script>
  import { createEventDispatcher } from 'svelte';

  export let selected = '';
  export let amount = '';
  export let coins = [];
  export let label = ''; // Yeni eklenen özellik

  const dispatch = createEventDispatcher();

  function handleInput(e) {
    const raw = e.target.value.replace(',', '.');
    amount = raw;
    dispatch('input');
  }

  function handleSelectChange(e) {
    selected = e.target.value;
    dispatch('input');
  }

  function getLogo(id) {
    const coin = coins.find(c => c.id === id);
    return coin?.image || '';
  }

  function getUSDPrice(id) {
    const coin = coins.find(c => c.id === id);
    return coin?.usd || 0;
  }

  function formatUSD(value) {
    const num = Number(value);
    if (isNaN(num)) return '$0,00';
    return num.toLocaleString('tr-TR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  $: usdValue = amount && getUSDPrice(selected)
    ? (parseFloat(amount) * getUSDPrice(selected)).toFixed(2)
    : '0.00';
</script>

<div class="bg-gray-50 p-4 rounded-xl border shadow space-y-2 relative">
  {#if label}
    <div class="absolute top-2 left-4 text-xs font-semibold text-gray-400">
      {label}
    </div>
  {/if}

  <div class="flex items-center justify-between space-x-2 pt-4">
    <input
      type="text"
      inputmode="decimal"
      placeholder="0.00"
      class="w-full text-2xl outline-none bg-transparent"
      bind:value={amount}
      on:input={handleInput}
    />

    <div class="flex items-center space-x-1 shrink-0">
      {#if coins.length && getLogo(selected)}
        <img src={getLogo(selected)} alt="coin" class="w-8 h-8 rounded-full" />
      {/if}

      <div class="relative">
        <select
          bind:value={selected}
          on:change={handleSelectChange}
          class="appearance-none bg-white border text-sm rounded pr-6 pl-2 py-1"
        >
          {#each coins as coin}
            <option value={coin.id}>
              {coin.symbol.toUpperCase()}
            </option>
          {/each}
        </select>

        <div class="absolute inset-y-0 right-1 flex items-center pointer-events-none text-gray-500 text-xs">
          ▼
        </div>
      </div>
    </div>
  </div>

  <div class="text-sm text-gray-500">
    ≈ {formatUSD(usdValue)}
  </div>
</div>