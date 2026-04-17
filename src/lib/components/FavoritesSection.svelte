<script lang="ts">
  import { onMount } from 'svelte'

  const basePath = import.meta.env.VITE_API_MOUNT_PATH || "";

  interface Favorite {
    id: number
    user_id: string
    coin_id: string
    coin_name: string | null
    coin_symbol: string | null
    coin_image: string | null
    created_at: number
  }

  // State using Svelte 5 runes
  let favorites = $state<Favorite[]>([])
  let isLoading = $state(false)
  let error = $state<string | null>(null)

  async function fetchFavorites() {
    isLoading = true
    error = null
    try {
      const res = await fetch(`${basePath}/api/favorites?user_id=public`)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      favorites = data.favorites || []
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to fetch favorites'
    } finally {
      isLoading = false
    }
  }

  async function removeFavorite(coinId: string) {
    try {
      const res = await fetch(`${basePath}/api/favorites?user_id=public&coin_id=${coinId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        favorites = favorites.filter(f => f.coin_id !== coinId)
      }
    } catch (e) {
      console.error('Failed to remove favorite:', e)
    }
  }

  // Expose refresh function for external use
  export function refresh() {
    fetchFavorites()
  }

  onMount(() => {
    fetchFavorites()
  })
</script>

<div class="w-full max-w-6xl mx-auto mb-8">
  <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      Favorite Coins
    </h3>

    {#if isLoading}
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    {:else if error}
      <div class="text-center py-8 text-red-500 dark:text-red-400">
        <p>Error: {error}</p>
        <button
          onclick={() => fetchFavorites()}
          class="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Try again
        </button>
      </div>
    {:else if favorites.length === 0}
      <p class="text-center py-8 text-gray-500 dark:text-gray-400">
        No favorite coins yet. Click the star icon on a coin to add it to your favorites.
      </p>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {#each favorites as favorite (favorite.id)}
          <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-3">
              {#if favorite.coin_image}
                <img
                  src={favorite.coin_image}
                  alt={favorite.coin_name || favorite.coin_id}
                  width="32"
                  height="32"
                  class="rounded-full"
                />
              {:else}
                <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {favorite.coin_symbol?.charAt(0) || '?'}
                  </span>
                </div>
              {/if}
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {favorite.coin_name || favorite.coin_id}
                </p>
                {#if favorite.coin_symbol}
                  <p class="text-xs text-gray-500 dark:text-gray-400 uppercase">
                    {favorite.coin_symbol}
                  </p>
                {/if}
              </div>
            </div>
            <button
              onclick={() => removeFavorite(favorite.coin_id)}
              class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Remove from favorites"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
