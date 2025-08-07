<script>
  import '../app.css';
  import AnimatedBackground from '$lib/components/AnimatedBackground.svelte';
  import Header from '$lib/components/Header.svelte';
  import Balances from '$lib/components/Balances.svelte';
  import { connectWallet } from '$lib/helpers/wallet';
  import { balances, initialBalance } from '$lib/store';

  let { children } = $props();

  async function handleConnect() {
    console.log("MetaMask bağlantısı tetiklendi");
    await connectWallet();
    balances.set(initialBalance); // sahte bakiye ata
  }
</script>

<AnimatedBackground />

<div class="relative z-10 flex flex-col min-h-screen pt-20">
  <Header on:connect={handleConnect} />

  <div class="flex-grow flex flex-col items-center justify-center py-10">
    <Balances />
    {@render children()}
  </div>
</div>