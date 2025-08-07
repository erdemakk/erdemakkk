<script>
  export let title;
  export let image;
  export let url;
  export let body;

  let number = 0;

  function increment() {
    number += 1;
  }
</script>

<div
  on:click={increment}
  role="button"
  tabindex="0"
  class="bg-white rounded-xl shadow p-3 flex flex-col items-start hover:shadow-lg transition-all duration-200 cursor-pointer no-underline"
  on:keydown={(e) => {
    if (e.key === 'Enter') {
      increment();
      window.open(url, '_blank');
    }
  }}
>
  <a
    href={url}
    target="_blank"
    rel="noopener"
    class="w-full"
  >
    {#if image}
      <img
        src={image}
        alt={title}
        class="rounded-md mb-2 w-full h-36 object-cover shadow"
        on:error={(e) => e.target.style.display = 'none'}
      />
    {/if}

    <div class="text-base font-bold mb-1 text-gray-900">{title}</div>

    {#if body}
      <p class="text-gray-600 text-sm mb-1">
        {body.slice(0, 100)}...
      </p>
    {/if}

    <span class="text-blue-600 text-xs mt-2 underline">Read More</span>
  </a>

  <p class="text-sm text-gray-700 mt-2 italic">
    Clicked {number} {number === 1 ? 'time' : 'times'}
  </p>
</div>
