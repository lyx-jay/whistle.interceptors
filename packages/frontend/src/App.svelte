<script lang="ts">
  import Rules from '@/lib/Rules.svelte'
  import { ruleStore } from '@/lib/stores/rules'
  import { onMount } from 'svelte'

  onMount(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault() // 阻止浏览器默认的保存行为
        ruleStore.saveRules()
      }
    }

    document.addEventListener('keydown', handleKeydown)

    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  })
</script>

<main>
  <Rules />
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #1a1a1a;
  }

  main {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
</style>
