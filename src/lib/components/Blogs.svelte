<script>
  import BlogCard from './BlogCard.svelte';
  import { onMount } from 'svelte';

  let posts = [];
  let loading = true;
  let error = false;

  onMount(async () => {
    try {
      const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
      const data = await response.json();

      console.log(data.Data[0]); // debug: ilk postu gör
      posts = data.Data.slice(0, 8); // ilk 8 haber
    } catch (err) {
      error = true;
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="text-gray-400 text-center py-10">Loading news...</div>
{:else if error}
  <div class="text-red-500 text-center py-10">Failed to load news.</div>
{:else}
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {#each posts as post}
      <BlogCard
        title={post.title}
        image={
          post.imageurl || // ✅ Zaten tam URL, başına hiçbir şey eklenmiyor
          post.thumbnail || // Alternatif olarak thumbnail
          (post.source_info?.img && `https://www.cryptocompare.com${post.source_info.img}`) || // veya source_info.img
          'https://cryptologos.cc/logos/bitcoin-btc-logo.png' // fallback görsel
        }
        url={post.url}
        body={post.body}
      />
    {/each}
  </div>
{/if}
