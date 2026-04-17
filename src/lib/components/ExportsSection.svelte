<script lang="ts">
  import { onMount } from 'svelte'

  interface Props {
    compact?: boolean
  }

  let { compact = false }: Props = $props()

  interface ExportItem {
    key: string
    size: number
    uploaded: string
  }

  let exports = $state<ExportItem[]>([])
  let isLoading = $state(true)
  let error = $state<string | null>(null)
  let isCreating = $state(false)
  let exportName = $state('')

  async function fetchExports() {
    try {
      const res = await fetch('/api/export')
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      exports = data.exports || []
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to fetch exports'
    } finally {
      isLoading = false
    }
  }

  async function createExport() {
    isCreating = true
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: exportName || `Export ${new Date().toLocaleString()}`,
          timestamp: new Date().toISOString(),
          data: { sample: 'data', count: Math.floor(Math.random() * 100) },
        }),
      })

      if (res.ok) {
        exportName = ''
        await fetchExports()
      }
    } catch (e) {
      console.error('Failed to create export:', e)
    } finally {
      isCreating = false
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  onMount(() => {
    fetchExports()
  })
</script>

{#if compact}
  <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span class="text-lg">📦</span>
        R2 Exports
      </h3>
      {#if error}
        <span class="text-xs text-red-500">Error</span>
      {:else if !isLoading}
        <span class="text-xs text-gray-500">{exports.length} files</span>
      {/if}
    </div>

    {#if isLoading}
      <div class="flex items-center justify-center py-4">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
      </div>
    {:else}
      <div class="space-y-2 max-h-32 overflow-y-auto">
        {#if exports.length === 0}
          <p class="text-xs text-gray-500 dark:text-gray-400 text-center py-2">No exports yet</p>
        {:else}
          {#each exports.slice(0, 3) as exp}
            <div class="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-gray-50 dark:bg-gray-800">
              <span class="text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{exp.key.replace('exports/', '')}</span>
              <span class="text-gray-500 dark:text-gray-400">{formatSize(exp.size)}</span>
            </div>
          {/each}
          {#if exports.length > 3}
            <p class="text-xs text-gray-500 dark:text-gray-400 text-center">+{exports.length - 3} more</p>
          {/if}
        {/if}
      </div>
      <button
        onclick={createExport}
        disabled={isCreating}
        class="w-full mt-3 px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isCreating ? 'Creating...' : 'New Export'}
      </button>
    {/if}
  </div>
{:else}
  <div class="w-full max-w-6xl mx-auto mb-8">
    <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span class="text-xl">📦</span>
        R2 Exports
      </h3>

      {#if isLoading}
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      {:else if error}
        <div class="text-center py-8 text-red-500 dark:text-red-400">
          <p>Error: {error}</p>
          <button
            onclick={() => { isLoading = true; fetchExports() }}
            class="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Try again
          </button>
        </div>
      {:else}
        <div class="mb-4">
          <div class="flex gap-2">
            <input
              type="text"
              placeholder="Export name (optional)"
              bind:value={exportName}
              class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onclick={createExport}
              disabled={isCreating}
              class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm"
            >
              {isCreating ? 'Creating...' : 'Create Export'}
            </button>
          </div>
        </div>

        {#if exports.length === 0}
          <p class="text-center py-8 text-gray-500 dark:text-gray-400">
            No exports yet. Create one to store data in R2.
          </p>
        {:else}
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th class="pb-2 font-medium">Name</th>
                  <th class="pb-2 font-medium text-right">Size</th>
                  <th class="pb-2 font-medium text-right">Created</th>
                </tr>
              </thead>
              <tbody>
                {#each exports as exp}
                  <tr class="border-b border-gray-100 dark:border-gray-800">
                    <td class="py-2 text-gray-900 dark:text-white font-mono text-xs">{exp.key.replace('exports/', '')}</td>
                    <td class="py-2 text-gray-500 dark:text-gray-400 text-right">{formatSize(exp.size)}</td>
                    <td class="py-2 text-gray-500 dark:text-gray-400 text-right">{formatDate(exp.uploaded)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      {/if}
    </div>
  </div>
{/if}
