<script>
  import { createEventDispatcher } from 'svelte';
  import { account, logout } from '$lib/store';

  const dispatch = createEventDispatcher();
</script>

<header class="fixed top-0 left-0 w-full z-20 bg-zinc-900 text-white flex items-center justify-between px-4 py-3 border-b border-zinc-700 shadow-md">
  <h1 class="text-xl font-black">ERD SWAP</h1>

  {#if $account}
    <div class="flex items-center space-x-4">
      <span class="text-sm bg-zinc-700 text-white px-3 py-1 rounded shadow">
        {$account.slice(0, 6)}...{$account.slice(-4)}
      </span>
      <button
        class="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
        on:click={logout}>
        Logout
      </button>
    </div>
  {:else}
    <img
      src="/payw-metamask.png"
      alt="Pay with MetaMask"
      class="w-40 cursor-pointer"
      on:click={() => dispatch('connect')}
    />
  {/if}
</header>
