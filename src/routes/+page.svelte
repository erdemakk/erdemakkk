<script>
  import Header from '$lib/components/Header.svelte';
  import SwapBox from '$lib/components/SwapBox.svelte';
  import Balances from '$lib/components/Balances.svelte';
  import { connectWallet } from '$lib/helpers/wallet';
  import { balances, initialBalance } from '$lib/store';

  async function handleConnect() {
    console.log("MetaMask bağlantısı tetiklendi");
    await connectWallet();
    balances.set(initialBalance); // sahte bakiye ata
  }
</script>

<Header on:connect={handleConnect} />

<!-- Sağ üstte sabit bakiye kutusu -->
<Balances />

<main class="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 pt-10">
  <SwapBox />
</main>

