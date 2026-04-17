<script lang="ts">
  import { onMount } from 'svelte'

  const basePath = import.meta.env.PUBLIC_API_MOUNT_PATH || "";

  interface Props {
    compact?: boolean
  }

  let { compact = false }: Props = $props()

  interface FeatureFlags {
    [key: string]: boolean
  }

  const FLAG_LABELS: Record<string, string> = {
    dark_mode: 'Dark Mode',
    show_favorites: 'Show Favorites',
    show_exports: 'Show Exports',
    show_page_views: 'Show Page Views',
    experimental_features: 'Experimental Features',
  }

  let flags = $state<FeatureFlags>({})
  let isLoading = $state(true)
  let error = $state<string | null>(null)
  let updating = $state<string | null>(null)

  async function fetchFlags() {
    try {
      const res = await fetch(`${basePath}/api/flags`)
      const data = await res.json()
      if (data.error && res.status !== 200) {
        error = data.error
      }
      flags = data.flags || {}
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to fetch flags'
    } finally {
      isLoading = false
    }
  }

  async function toggleFlag(flag: string) {
    updating = flag
    try {
      const res = await fetch(`${basePath}/api/flags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag, value: !flags[flag] }),
      })
      if (res.ok) {
        flags = { ...flags, [flag]: !flags[flag] }
      }
    } catch (e) {
      console.error('Failed to update flag:', e)
    } finally {
      updating = null
    }
  }

  onMount(() => {
    fetchFlags()
  })
</script>

{#if compact}
  <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span class="text-lg">🚩</span>
        Feature Flags
      </h3>
      {#if error}
        <span class="text-xs text-red-500">Error</span>
      {/if}
    </div>

    {#if isLoading}
      <div class="flex items-center justify-center py-4">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
      </div>
    {:else}
      <div class="space-y-2">
        {#each Object.entries(flags) as [key, value]}
          <div class="flex items-center justify-between py-1">
            <span class="text-xs text-gray-600 dark:text-gray-400">{FLAG_LABELS[key] || key}</span>
            <button
              role="switch"
              aria-checked={value}
              disabled={updating === key}
              onclick={() => toggleFlag(key)}
              class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors {value ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'} {updating === key ? 'opacity-50' : ''}"
            >
              <span
                class="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform {value ? 'translate-x-5' : 'translate-x-0.5'}"
              ></span>
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <div class="w-full max-w-6xl mx-auto mb-8">
    <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span class="text-xl">🚩</span>
        Feature Flags
      </h3>

      {#if isLoading}
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      {:else if error}
        <div class="text-center py-8 text-red-500 dark:text-red-400">
          <p>Error: {error}</p>
          <button
            onclick={() => { isLoading = true; fetchFlags() }}
            class="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Try again
          </button>
        </div>
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {#each Object.entries(flags) as [key, value]}
            <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <span class="text-sm text-gray-700 dark:text-gray-300">{FLAG_LABELS[key] || key}</span>
              <button
                role="switch"
                aria-checked={value}
                disabled={updating === key}
                onclick={() => toggleFlag(key)}
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors {value ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'} {updating === key ? 'opacity-50' : ''}"
              >
                <span
                  class="inline-block h-4 w-4 rounded-full bg-white transition-transform {value ? 'translate-x-6' : 'translate-x-1'}"
                ></span>
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
