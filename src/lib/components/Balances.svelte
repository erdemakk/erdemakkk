<script>
  import { balances, account } from '$lib/store';
  import { ethers } from 'ethers';

  function formatBalance(value) {
    if (value === null || value === undefined) {
      return '0';
    }

    // ethers.js BigInt değerini doğrudan formatlayabilir.
    // Başka bir fonksiyona gerek yoktur.
    try {
      return ethers.utils.formatEther(value);
    } catch (err) {
      console.error('Bakiye formatlama hatası:', err);
      return '0';
    }
  }
</script>

{#if $account && Object.keys($balances).length > 0}
  <div class="absolute top-20 right-4 bg-white shadow-lg rounded-lg p-4 w-60 border z-50">
    <h3 class="text-md font-bold text-gray-700 mb-2">Your Balances</h3>

    <ul class="space-y-1 text-sm text-gray-800">
      {#each Object.entries($balances) as [coin, value]}
        <li class="flex justify-between">
          <span class="font-medium">{coin.toUpperCase()}</span>
          <span>{formatBalance(value)}</span>
        </li>
      {/each}
    </ul>
  </div>
{/if}