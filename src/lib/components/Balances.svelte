<script>
  import { balances, account } from '$lib/store';
  import { ethers } from 'ethers';

  function formatBalance(value) {
    if (value === null || value === undefined) {
      return '0.00';
    }
    try {
      // ethers.js BigNumber objesini formatlayın
      return ethers.utils.formatUnits(value, 'ether').substring(0, 10);
    } catch (err) {
      console.error('Bakiye formatlama hatası:', err);
      return '0.00';
    }
  }
</script>

{#if $account && Object.keys($balances).length > 0}
  <div class="fixed top-20 right-4 bg-zinc-800/80 backdrop-blur-lg shadow-lg rounded-xl p-4 w-60 border border-zinc-700 z-50">
    <h3 class="text-md font-bold text-white mb-2">Your Balances</h3>

    <ul class="space-y-1 text-sm text-gray-200">
      {#each Object.entries($balances) as [coin, value]}
        <li class="flex justify-between">
          <span class="font-medium">{coin.toUpperCase()}</span>
          <span>{formatBalance(value)}</span>
        </li>
      {/each}
    </ul>
  </div>
{/if}