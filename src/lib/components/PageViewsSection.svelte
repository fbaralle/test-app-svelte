<script lang="ts">
  import { onMount } from 'svelte'

  const basePath = import.meta.env.PUBLIC_API_MOUNT_PATH || "";

  interface Props {
    compact?: boolean
  }

  let { compact = false }: Props = $props()

  interface PageViewsData {
    totalViews: number
    uniqueVisitors: number
  }

  let data = $state<PageViewsData | null>(null)
  let isLoading = $state(true)
  let error = $state<string | null>(null)
  let isTracking = $state(false)

  async function fetchPageViews() {
    try {
      const res = await fetch(`${basePath}/api/pageviews`)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || `HTTP ${res.status}`)
      }
      data = await res.json()
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to fetch page views'
    } finally {
      isLoading = false
    }
  }

  async function trackPageView() {
    isTracking = true
    try {
      // Get or create visitor ID from localStorage
      let visitorId = localStorage.getItem('visitor_id')
      if (!visitorId) {
        visitorId = `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`
        localStorage.setItem('visitor_id', visitorId)
      }

      const res = await fetch(`${basePath}/api/pageviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId }),
      })

      if (res.ok) {
        const result = await res.json()
        data = {
          totalViews: result.totalViews,
          uniqueVisitors: data?.uniqueVisitors ?? 0 + (result.isNewVisitor ? 1 : 0),
        }
        // Refresh to get accurate counts
        await fetchPageViews()
      }
    } catch (e) {
      console.error('Failed to track page view:', e)
    } finally {
      isTracking = false
    }
  }

  onMount(() => {
    fetchPageViews()
  })
</script>

{#if compact}
  <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span class="text-lg">📊</span>
        Page Views
      </h3>
      {#if error}
        <span class="text-xs text-red-500">Error</span>
      {/if}
    </div>

    {#if isLoading}
      <div class="flex items-center justify-center py-4">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
      </div>
    {:else if data}
      <div class="grid grid-cols-2 gap-3">
        <div class="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <p class="text-lg font-bold text-gray-900 dark:text-white">{data.totalViews.toLocaleString()}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Total Views</p>
        </div>
        <div class="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <p class="text-lg font-bold text-gray-900 dark:text-white">{data.uniqueVisitors.toLocaleString()}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Unique</p>
        </div>
      </div>
      <button
        onclick={trackPageView}
        disabled={isTracking}
        class="w-full mt-3 px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isTracking ? 'Tracking...' : 'Track View'}
      </button>
    {/if}
  </div>
{:else}
  <div class="w-full max-w-6xl mx-auto mb-8">
    <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span class="text-xl">📊</span>
        Page Views
      </h3>

      {#if isLoading}
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      {:else if error}
        <div class="text-center py-8 text-red-500 dark:text-red-400">
          <p>Error: {error}</p>
          <button
            onclick={() => { isLoading = true; fetchPageViews() }}
            class="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Try again
          </button>
        </div>
      {:else if data}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div class="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{data.totalViews.toLocaleString()}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Page Views</p>
          </div>
          <div class="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{data.uniqueVisitors.toLocaleString()}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Unique Visitors (24h)</p>
          </div>
        </div>
        <div class="flex justify-center">
          <button
            onclick={trackPageView}
            disabled={isTracking}
            class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isTracking ? 'Tracking...' : 'Track Page View'}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
